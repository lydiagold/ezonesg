import { CategorySlug } from './product.model';

/** Storefront category. Configurable in Phase 3 via the `ezone-categories` table. */
export interface Category {
  slug: CategorySlug;
  name: string;
  /** Short tagline shown on category landing/hero. */
  tagline: string;
  /** Route the shop nav points at, e.g. `/shop/phones`. */
  route: string;
}
