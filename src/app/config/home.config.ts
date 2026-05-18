export interface TrustPoint {
  icon: string;
  title: string;
  desc: string;
}

export interface HeroStat {
  num: string;
  label: string;
}

export const TRUST_POINTS: TrustPoint[] = [
  {
    icon: '🌿',
    title: 'Premium Quality',
    desc: 'Sourced from the finest farms worldwide, handpicked for freshness and quality.'
  },
  {
    icon: '📦',
    title: 'Freshly Packed',
    desc: 'Packed fresh to order in hygienic, sealed packaging to preserve natural goodness.'
  },
  {
    icon: '💚',
    title: 'Healthy Snacking',
    desc: 'No artificial additives, colours, or preservatives. Pure, natural nutrition.'
  },
  {
    icon: '🏢',
    title: 'Corporate Bulk Orders',
    desc: 'Custom bulk orders for offices, events, and gifting seasons across Singapore.'
  },
  {
    icon: '📱',
    title: 'WhatsApp Easy Ordering',
    desc: 'Order quickly and conveniently via WhatsApp. We reply fast, 7 days a week.'
  }
];

export const HERO_STATS: HeroStat[] = [
  { num: '12+', label: 'Products' },
  { num: '500+', label: 'Happy Customers' },
  { num: '100%', label: 'Natural' }
];
