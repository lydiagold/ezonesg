/**
 * Server-side cart / order-draft (status = CART). A guest's cart is persisted
 * server-side and referenced by a strong OPAQUE token (never a sequential id).
 * The browser keeps only the opaque token locally.
 *
 * Pricing/name/sku on items are RESOLVED BY THE SERVER from the catalogue — the
 * client only ever sends { productId, variantId, quantity }. No real Order is
 * created here; conversion to an Order happens later at the payment step.
 */
export type CartDraftStatus = 'CART' | 'ORDER_DRAFT';

export interface CartDraftCustomer {
  name: string;
  email: string;
  mobile: string;
}

export interface CartDraftItem {
  itemId: string;
  productId: string;
  variantId: string;
  quantity: number;
  // Server-resolved (authoritative) snapshot fields:
  productName: string;
  slug: string;
  sku: string;
  variantDescription: string;
  unitPrice: number;
  lineTotal: number;
  image: string;
}

export interface CartDraft {
  id: string;
  opaqueToken: string;
  status: CartDraftStatus;

  customer?: CartDraftCustomer;

  termsAcceptedAt?: string;
  termsVersion?: string;
  privacyAcceptedAt?: string;
  privacyVersion?: string;

  items: CartDraftItem[];
  subtotal: number;
  currency: 'SGD';

  createdAt: string;
  updatedAt: string;
  /** ISO expiry; server also sets a DynamoDB TTL for auto-cleanup. */
  expiresAt: string;
}

/** What the client sends to add/update an item — never price/name. */
export interface CartItemInput {
  productId: string;
  variantId: string;
  quantity: number;
}

/** Payload to create a cart, optionally seeding identity + items. */
export interface CreateCartInput {
  customer?: CartDraftCustomer;
  terms?: {
    termsAcceptedAt: string;
    termsVersion: string;
    privacyAcceptedAt: string;
    privacyVersion: string;
  };
  items?: CartItemInput[];
}
