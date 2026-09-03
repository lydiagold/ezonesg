import { Injectable, computed, effect, signal } from '@angular/core';

/**
 * Policy versions. Bump when the corresponding policy page changes materially —
 * a bump re-prompts the customer to re-accept. Kept in sync with pages/policy.
 */
export const TERMS_VERSION = '2026-01';
export const PRIVACY_VERSION = '2026-01';

export interface CustomerIdentity {
  name: string;
  email: string;
  mobile: string;
  /** GUEST now; REGISTERED_CUSTOMER once Cognito accounts land (Increment B). */
  type: 'GUEST' | 'REGISTERED_CUSTOMER';
  termsAcceptedAt: string;
  termsVersion: string;
  privacyAcceptedAt: string;
  privacyVersion: string;
}

const KEY = 'ezone_identity';

/**
 * Lightweight guest-identity store for the add-to-cart flow. Persists the
 * customer's contact details and *versioned, timestamped* terms/privacy
 * acceptance locally. This is the frontend seam that Increment B (Cognito) will
 * extend with real accounts and a server-side cart/order-draft association.
 *
 * Deliberately stores acceptance as timestamp + version (never a bare boolean).
 */
@Injectable({ providedIn: 'root' })
export class CustomerIdentityService {
  private readonly _identity = signal<CustomerIdentity | null>(this.load());

  /** Whether the add-to-cart identity modal is currently open. */
  readonly promptOpen = signal(false);

  readonly identity = this._identity.asReadonly();

  /** Valid = contact details present AND current policy versions accepted. */
  readonly hasValidIdentity = computed(() => {
    const id = this._identity();
    return (
      !!id &&
      !!id.name && !!id.email && !!id.mobile &&
      id.termsVersion === TERMS_VERSION &&
      id.privacyVersion === PRIVACY_VERSION
    );
  });

  constructor() {
    effect(() => {
      const id = this._identity();
      if (id) localStorage.setItem(KEY, JSON.stringify(id));
      else localStorage.removeItem(KEY);
    });
  }

  private load(): CustomerIdentity | null {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  /** Save identity + record terms/privacy acceptance at the current versions. */
  save(details: { name: string; email: string; mobile: string }): void {
    const now = new Date().toISOString();
    this._identity.set({
      name: details.name.trim(),
      email: details.email.trim(),
      mobile: details.mobile.trim(),
      type: 'GUEST',
      termsAcceptedAt: now,
      termsVersion: TERMS_VERSION,
      privacyAcceptedAt: now,
      privacyVersion: PRIVACY_VERSION,
    });
  }

  clear(): void {
    this._identity.set(null);
  }

  /** Open the identity modal only if identity is missing/stale. */
  promptIfNeeded(): boolean {
    if (this.hasValidIdentity()) return false;
    this.promptOpen.set(true);
    return true;
  }

  openPrompt(): void {
    this.promptOpen.set(true);
  }

  closePrompt(): void {
    this.promptOpen.set(false);
  }
}
