/**
 * Core product domain model for the EZONE storefront.
 *
 * Designed to mirror the Phase 2 DynamoDB `ezone-products` item so the frontend
 * repository abstraction can swap from mock data to the real API with no shape
 * changes. Variants are embedded (small catalogue); stock lives on the variant.
 */

export type CategorySlug = 'phones' | 'tablets' | 'accessories';

export type Currency = 'SGD';

/** A single purchasable configuration of a product (e.g. 256GB / Black). */
export interface ProductVariant {
  id: string;
  sku: string;
  /** Free-form attributes — never hard-code per-category DB columns. */
  attributes: Record<string, string>;
  /** Overrides the parent product price when set. */
  priceOverride?: number;
  stockQuantity: number;
  active: boolean;
}

export interface ProductImage {
  /** S3 object key in Phase 2; local asset path in Phase 1. */
  key: string;
  url: string;
  alt: string;
  primary?: boolean;
  sort?: number;
}

export interface Product {
  id: string;
  slug: string;
  sku: string;
  name: string;
  brand: string;
  category: CategorySlug;

  description: string;
  shortDescription: string;

  /** Base list price in SGD. */
  price: number;
  /** Original/RRP price, shown struck-through when higher than the sale price. */
  originalPrice?: number;
  /** Active promotional price; when set it is the effective price. */
  salePrice?: number;

  currency: Currency;

  images: ProductImage[];

  /** Category-level spec sheet, e.g. { "Display": "6.1-inch OLED" }. */
  attributes: Record<string, string>;

  /** Empty array = simple product with no variant selectors. */
  variants: ProductVariant[];

  featured: boolean;
  active: boolean;

  createdAt: string;
  updatedAt: string;
}

/** Effective unit price for a product, honouring salePrice over base price. */
export function effectivePrice(product: Product): number {
  return product.salePrice ?? product.price;
}

/** The compare-at price to strike through, or undefined if there's no discount. */
export function compareAtPrice(product: Product): number | undefined {
  const current = effectivePrice(product);
  const original = product.originalPrice ?? product.price;
  return original > current ? original : undefined;
}

/**
 * Total stock across all active variants. Every product (including simple
 * accessories) carries at least one variant, so stock always lives on variants.
 */
export function totalStock(product: Product): number {
  return product.variants
    .filter(v => v.active)
    .reduce((sum, v) => sum + Math.max(0, v.stockQuantity), 0);
}

export function inStock(product: Product): boolean {
  return totalStock(product) > 0;
}
