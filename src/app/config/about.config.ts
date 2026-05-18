export interface BrandValue {
  icon: string;
  title: string;
  desc: string;
}

export interface BrandStat {
  num: string;
  label: string;
}

export const BRAND_VALUES: BrandValue[] = [
  {
    icon: '🌿',
    title: 'Natural & Pure',
    desc: 'We believe in food as nature intended — no artificial additives, preservatives, or shortcuts.'
  },
  {
    icon: '🎯',
    title: 'Quality First',
    desc: 'Every product is carefully selected, tested, and packed to meet the highest quality standards.'
  },
  {
    icon: '❤️',
    title: 'Community Focused',
    desc: 'We support families, offices, and communities in Singapore with healthy, accessible nutrition.'
  },
  {
    icon: '🌱',
    title: 'Sustainable Sourcing',
    desc: 'We partner with responsible farms and suppliers who care about the planet as much as we do.'
  }
];

export const BRAND_STATS: BrandStat[] = [
  { num: '12+', label: 'Products' },
  { num: '500+', label: 'Customers' },
  { num: '5★', label: 'Rated' }
];
