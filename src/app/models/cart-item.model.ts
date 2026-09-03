/**
 * Cart line item. Variant-aware: the same product in two configurations
 * (e.g. 128GB Black vs 256GB Blue) are two distinct lines.
 *
 * A snapshot of price/name/image is stored so the cart survives catalogue
 * changes; authoritative pricing is always re-validated server-side at checkout.
 */
export interface CartItem {
  productId: string;
  slug: string;
  variantId: string;

  name: string;
  variantDescription: string;
  sku: string;
  image: string;

  unitPrice: number;
  quantity: number;

  /** Stock available for this variant at the time it was added (best-effort UX). */
  maxQuantity: number;
}

export function lineTotal(item: CartItem): number {
  return item.unitPrice * item.quantity;
}

/** Stable key identifying a unique product+variant line. */
export function cartItemKey(productId: string, variantId: string): string {
  return `${productId}::${variantId}`;
}
