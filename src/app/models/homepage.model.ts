/**
 * Public homepage configuration returned by GET /api/homepage (admin-managed).
 * Mirrors the backend DEFAULT_HOMEPAGE. All content is presentation-only; no
 * sensitive settings are ever included here.
 */
export interface HeroConfig {
  active: boolean;
  eyebrow: string;
  heading: string;
  description: string;
  primaryLabel: string;
  primaryUrl: string;
  secondaryLabel: string;
  secondaryUrl: string;
  desktopImageKey?: string;
  mobileImageKey?: string;
  desktopImageUrl?: string;
  mobileImageUrl?: string;
}

export interface CategoryCard {
  title: string;
  subtitle: string;
  imageKey?: string;
  imageUrl?: string;
  url: string;
  order: number;
  active: boolean;
}

export interface HomepageBanner {
  heading: string;
  description: string;
  ctaLabel: string;
  ctaLink: string;
  imageKey?: string;
  imageUrl?: string;
  mobileImageKey?: string;
  mobileImageUrl?: string;
  order: number;
  active: boolean;
}

export interface WhyShopItem {
  title: string;
  description: string;
  icon: string;
  order: number;
  active: boolean;
}

export interface HomepageConfig {
  hero: HeroConfig;
  categoryCards: { active: boolean; heading: string; items: CategoryCard[] };
  featured: { active: boolean; heading: string; description: string; productIds: string[] };
  banners: { active: boolean; items: HomepageBanner[] };
  whyShop: { active: boolean; heading: string; items: WhyShopItem[] };
  contactCta: { active: boolean; heading: string; description: string; whatsappEnabled: boolean; contactEnabled: boolean };
  sections: { key: string; order: number; active: boolean }[];
}

/** Built-in default — matches the storefront's current content. Used as the
 *  fallback when the API is unavailable or the app runs in mock mode. */
export const DEFAULT_HOMEPAGE: HomepageConfig = {
  hero: {
    active: true,
    eyebrow: 'New · iPhone Series',
    heading: 'Singapore electronics, made simple.',
    description: 'Genuine phones, EZONE tablets and everyday tech.',
    primaryLabel: 'Shop iPhones',
    primaryUrl: '/shop/phones',
    secondaryLabel: 'Shop Tablets',
    secondaryUrl: '/shop/tablets',
  },
  categoryCards: {
    active: true,
    heading: 'Shop by category',
    items: [
      { title: 'iPhones', subtitle: 'The latest Apple iPhone lineup.', url: '/shop/phones', order: 1, active: true },
      { title: 'Tablets', subtitle: 'EZONE and Android tablets for work and play.', url: '/shop/tablets', order: 2, active: true },
      { title: 'Accessories', subtitle: 'Chargers, cases and essentials.', url: '/shop/accessories', order: 3, active: true },
    ],
  },
  featured: { active: true, heading: 'Featured', description: 'Popular picks right now.', productIds: [] },
  banners: { active: true, items: [] },
  whyShop: {
    active: true,
    heading: 'Why shop with EZONE',
    items: [
      { title: 'Genuine products', description: 'Authentic iPhones and EZONE devices with local warranty.', icon: 'shield-check', order: 1, active: true },
      { title: 'Fast SG delivery', description: 'Islandwide delivery across Singapore.', icon: 'truck', order: 2, active: true },
      { title: 'Secure checkout', description: 'Payments handled securely by our payment provider.', icon: 'lock', order: 3, active: true },
      { title: 'Real support', description: 'Talk to a real person about your order.', icon: 'chat', order: 4, active: true },
    ],
  },
  contactCta: {
    active: true,
    heading: 'Questions before you buy?',
    description: "Reach out and we'll help you pick the right device.",
    whatsappEnabled: true,
    contactEnabled: true,
  },
  sections: [
    { key: 'hero', order: 1, active: true },
    { key: 'categoryCards', order: 2, active: true },
    { key: 'featured', order: 3, active: true },
    { key: 'banners', order: 4, active: true },
    { key: 'whyShop', order: 5, active: true },
    { key: 'contactCta', order: 6, active: true },
  ],
};
