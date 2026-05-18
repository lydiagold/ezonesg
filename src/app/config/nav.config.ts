export interface NavLink {
  label: string;
  path: string;
}

export const NAV_LINKS: NavLink[] = [
  { label: 'Home', path: '/orchardroots' },
  { label: 'Products', path: '/orchardroots/products' },
  { label: 'Corporate Gifting', path: '/orchardroots/corporate-gifting' },
  { label: 'About', path: '/orchardroots/about' },
  { label: 'Contact', path: '/contact' }
];

export const FOOTER_QUICK_LINKS: NavLink[] = [
  { label: 'Home', path: '/orchardroots' },
  { label: 'Products', path: '/orchardroots/products' },
  { label: 'Corporate Gifting', path: '/orchardroots/corporate-gifting' },
  { label: 'About Us', path: '/orchardroots/about' },
  { label: 'Contact', path: '/contact' }
];

export const FOOTER_CATEGORY_LINKS: NavLink[] = [
  { label: 'Premium Nuts', path: '/orchardroots/products' },
  { label: 'Dry Fruits', path: '/orchardroots/products' },
  { label: 'Trail Mixes', path: '/orchardroots/products' },
  { label: 'Gift Boxes', path: '/orchardroots/products' },
  { label: 'Festival Hampers', path: '/orchardroots/products' }
];
