import { Category } from '../models/category.model';

export interface NavLink {
  label: string;
  path: string;
}

/** Primary storefront navigation (header + footer). */
export const NAV_LINKS: NavLink[] = [
  { label: 'Home', path: '/' },
  { label: 'iPhones', path: '/shop/phones' },
  { label: 'Tablets', path: '/shop/tablets' },
  { label: 'Accessories', path: '/shop/accessories' },
];

export const FOOTER_LINKS: NavLink[] = [
  { label: 'Shop All', path: '/shop' },
  { label: 'About', path: '/about' },
  { label: 'Contact', path: '/contact' },
];

/** Configurable categories (Phase 3: served from `ezone-categories`). */
export const CATEGORIES: Category[] = [
  {
    slug: 'phones',
    name: 'iPhones',
    tagline: 'The latest Apple iPhone lineup.',
    route: '/shop/phones',
  },
  {
    slug: 'tablets',
    name: 'Tablets',
    tagline: 'EZONE and Android tablets for work and play.',
    route: '/shop/tablets',
  },
  {
    slug: 'accessories',
    name: 'Accessories',
    tagline: 'Chargers, cases and essentials.',
    route: '/shop/accessories',
  },
];
