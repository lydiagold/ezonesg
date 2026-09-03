import { Injectable, inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { CartDraftRepository } from './cart-draft.repository';
import { ProductRepository } from './product.repository';
import { Product, effectivePrice } from '../models/product.model';
import {
  CartDraft,
  CartDraftItem,
  CartItemInput,
  CreateCartInput,
  CartDraftCustomer,
} from '../models/cart-draft.model';

const STORE_KEY = 'ezone_cart_drafts';
const TTL_DAYS = 7;

/**
 * Phase-1 mock of the server-side cart. Persists drafts in localStorage keyed by
 * an opaque token and — like the real backend — RESOLVES item price/name/sku
 * authoritatively from the catalogue, ignoring anything the client might claim.
 * Expired drafts (past TTL) are treated as gone, mirroring the DynamoDB TTL.
 */
@Injectable()
export class MockCartDraftRepository extends CartDraftRepository {
  private readonly products = inject(ProductRepository);

  create(input: CreateCartInput): Observable<CartDraft> {
    return this.products.list().pipe(
      map(catalogue => {
        const now = new Date();
        const token = this.opaqueToken();
        const items = (input.items ?? []).map(i => this.resolveItem(catalogue, i));
        const draft: CartDraft = {
          id: token,
          opaqueToken: token,
          status: 'CART',
          customer: input.customer,
          ...input.terms,
          items,
          subtotal: items.reduce((s, i) => s + i.lineTotal, 0),
          currency: 'SGD',
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
          expiresAt: this.expiry(now),
        };
        this.persist(draft);
        return draft;
      })
    );
  }

  get(token: string): Observable<CartDraft | undefined> {
    return of(this.read(token));
  }

  patch(
    token: string,
    patch: { customer?: CartDraftCustomer; terms?: CreateCartInput['terms'] }
  ): Observable<CartDraft> {
    const draft = this.read(token);
    if (!draft) return throwError(() => new Error('Cart not found'));
    if (patch.customer) draft.customer = patch.customer;
    if (patch.terms) Object.assign(draft, patch.terms);
    return of(this.touch(draft));
  }

  addItem(token: string, item: CartItemInput): Observable<CartDraft> {
    return this.mutateItems(token, (draft, catalogue) => {
      const resolved = this.resolveItem(catalogue, item);
      const existing = draft.items.find(
        i => i.productId === resolved.productId && i.variantId === resolved.variantId
      );
      if (existing) {
        existing.quantity += resolved.quantity;
        existing.lineTotal = existing.unitPrice * existing.quantity;
      } else {
        draft.items.push(resolved);
      }
    });
  }

  updateItem(token: string, itemId: string, quantity: number): Observable<CartDraft> {
    return this.mutateItems(token, draft => {
      const it = draft.items.find(i => i.itemId === itemId);
      if (!it) return;
      if (quantity <= 0) {
        draft.items = draft.items.filter(i => i.itemId !== itemId);
      } else {
        it.quantity = quantity;
        it.lineTotal = it.unitPrice * quantity;
      }
    });
  }

  removeItem(token: string, itemId: string): Observable<CartDraft> {
    return this.mutateItems(token, draft => {
      draft.items = draft.items.filter(i => i.itemId !== itemId);
    });
  }

  // ---- internals ----

  private mutateItems(
    token: string,
    fn: (draft: CartDraft, catalogue: Product[]) => void
  ): Observable<CartDraft> {
    const draft = this.read(token);
    if (!draft) return throwError(() => new Error('Cart not found'));
    return this.products.list().pipe(
      map(catalogue => {
        fn(draft, catalogue);
        draft.subtotal = draft.items.reduce((s, i) => s + i.lineTotal, 0);
        return this.touch(draft);
      })
    );
  }

  /** Authoritative item resolution from the catalogue (mirrors the server). */
  private resolveItem(catalogue: Product[], input: CartItemInput): CartDraftItem {
    const product = catalogue.find(p => p.id === input.productId && p.active);
    if (!product) throw new Error('Product not available');
    const variant = product.variants.find(v => v.id === input.variantId && v.active);
    if (!variant) throw new Error('Selected option not available');
    const qty = Math.max(1, Math.min(input.quantity, variant.stockQuantity));
    const unitPrice = variant.priceOverride ?? effectivePrice(product);
    const variantDescription = Object.entries(variant.attributes)
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ');
    return {
      itemId: this.opaqueToken().slice(0, 16),
      productId: product.id,
      variantId: variant.id,
      quantity: qty,
      productName: product.name,
      slug: product.slug,
      sku: variant.sku,
      variantDescription,
      unitPrice,
      lineTotal: unitPrice * qty,
      image: product.images[0]?.url ?? '',
    };
  }

  private opaqueToken(): string {
    const rand = () => crypto.randomUUID().replace(/-/g, '');
    return `ez_${rand()}${rand().slice(0, 12)}`;
  }

  private expiry(from: Date): string {
    return new Date(from.getTime() + TTL_DAYS * 86400_000).toISOString();
  }

  private touch(draft: CartDraft): CartDraft {
    draft.updatedAt = new Date().toISOString();
    this.persist(draft);
    return draft;
  }

  private readAll(): Record<string, CartDraft> {
    try {
      return JSON.parse(localStorage.getItem(STORE_KEY) ?? '{}');
    } catch {
      return {};
    }
  }

  private read(token: string): CartDraft | undefined {
    const draft = this.readAll()[token];
    if (!draft) return undefined;
    if (new Date(draft.expiresAt).getTime() < Date.now()) {
      this.delete(token); // expired → gone, like the DynamoDB TTL
      return undefined;
    }
    return draft;
  }

  private persist(draft: CartDraft): void {
    const all = this.readAll();
    all[draft.opaqueToken] = draft;
    localStorage.setItem(STORE_KEY, JSON.stringify(all));
  }

  private delete(token: string): void {
    const all = this.readAll();
    delete all[token];
    localStorage.setItem(STORE_KEY, JSON.stringify(all));
  }
}
