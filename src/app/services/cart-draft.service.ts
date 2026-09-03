import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { concat, defer, Observable, of } from 'rxjs';
import { catchError, last, switchMap } from 'rxjs/operators';
import { CartDraftRepository } from '../repositories/cart-draft.repository';
import { CartService } from './cart.service';
import { CustomerIdentityService } from './customer-identity.service';
import { CartDraft, CartItemInput } from '../models/cart-draft.model';

const TOKEN_KEY = 'ezone_cart_token';

/**
 * Associates the guest's local cart with a server-side cart / order-draft
 * (status = CART), referenced by a strong OPAQUE token kept in localStorage.
 *
 * - The draft is created only once the customer has a valid identity (name +
 *   email + mobile + accepted terms) — we never create server carts for pure
 *   anonymous browsing.
 * - The client sends only { productId, variantId, quantity }; the server (mock
 *   here) resolves authoritative price/name/sku.
 * - Terms/privacy version + timestamp travel with the draft.
 * - Sync is best-effort: the local cart remains the UX source of truth, so a
 *   backend hiccup never blocks a guest from shopping.
 */
@Injectable({ providedIn: 'root' })
export class CartDraftService {
  private readonly repo = inject(CartDraftRepository);
  private readonly cart = inject(CartService);
  private readonly identity = inject(CustomerIdentityService);

  private readonly _token = signal<string | null>(localStorage.getItem(TOKEN_KEY));
  private readonly _draft = signal<CartDraft | undefined>(undefined);

  readonly token = this._token.asReadonly();
  readonly draft = this._draft.asReadonly();
  readonly hasServerCart = computed(() => !!this._token());

  private lastSignature = '';
  private syncing = false;

  constructor() {
    // Rehydrate an existing draft on load (validates server-side TTL).
    const existing = this._token();
    if (existing) {
      this.repo.get(existing).subscribe(draft => {
        if (draft) this._draft.set(draft);
        else this.forgetToken(); // expired / gone
      });
    }

    // Keep the server draft in step with the local cart + identity. Guarded by a
    // signature so it only fires on real changes and never loops.
    effect(
      () => {
        const items = this.cart.items();
        const hasIdentity = this.identity.hasValidIdentity();
        const id = this.identity.identity();
        const signature = JSON.stringify({
          i: items.map(it => `${it.productId}:${it.variantId}:${it.quantity}`),
          e: id?.email ?? '',
          t: id?.termsVersion ?? '',
        });
        if (!hasIdentity || signature === this.lastSignature) return;
        this.lastSignature = signature;
        this.sync();
      },
      { allowSignalWrites: true }
    );
  }

  /** Explicitly (re)associate — called from the "Continue as Guest" step. */
  associate(): void {
    this.lastSignature = ''; // force a sync
    this.sync();
  }

  private desiredItems(): CartItemInput[] {
    return this.cart.items().map(i => ({
      productId: i.productId,
      variantId: i.variantId,
      quantity: i.quantity,
    }));
  }

  private customerPayload() {
    const id = this.identity.identity();
    if (!id) return { customer: undefined, terms: undefined };
    return {
      customer: { name: id.name, email: id.email, mobile: id.mobile },
      terms: {
        termsAcceptedAt: id.termsAcceptedAt,
        termsVersion: id.termsVersion,
        privacyAcceptedAt: id.privacyAcceptedAt,
        privacyVersion: id.privacyVersion,
      },
    };
  }

  private sync(): void {
    if (this.syncing || !this.identity.hasValidIdentity()) return;
    const items = this.desiredItems();
    if (items.length === 0) return;

    this.syncing = true;
    const { customer, terms } = this.customerPayload();
    const token = this._token();

    const done = (draft?: CartDraft) => {
      this.syncing = false;
      if (draft) {
        this._draft.set(draft);
        this.rememberToken(draft.opaqueToken);
      }
    };

    if (!token) {
      // No server cart yet — create one with the full item set in one call.
      this.repo
        .create({ customer, terms, items })
        .pipe(catchError(() => of(undefined)))
        .subscribe(done);
      return;
    }

    // Existing cart — update identity/terms, then reconcile items to match.
    this.repo
      .patch(token, { customer, terms })
      .pipe(
        switchMap(draft => this.reconcile(token, draft, items)),
        catchError(() => of(undefined))
      )
      .subscribe(done);
  }

  /** Reconcile the server draft's items to match `desired` via granular ops. */
  private reconcile(
    token: string,
    draft: CartDraft,
    desired: CartItemInput[]
  ): Observable<CartDraft> {
    const key = (x: { productId: string; variantId: string }) =>
      `${x.productId}::${x.variantId}`;
    const want = new Map(desired.map(d => [key(d), d]));
    const ops: Observable<CartDraft>[] = [];

    for (const it of draft.items) {
      const d = want.get(key(it));
      if (!d) ops.push(defer(() => this.repo.removeItem(token, it.itemId)));
      else if (d.quantity !== it.quantity)
        ops.push(defer(() => this.repo.updateItem(token, it.itemId, d.quantity)));
      want.delete(key(it));
    }
    for (const d of want.values()) ops.push(defer(() => this.repo.addItem(token, d)));

    return ops.length === 0 ? of(draft) : concat(...ops).pipe(last());
  }

  private rememberToken(token: string): void {
    this._token.set(token);
    localStorage.setItem(TOKEN_KEY, token);
  }

  private forgetToken(): void {
    this._token.set(null);
    this._draft.set(undefined);
    localStorage.removeItem(TOKEN_KEY);
  }
}
