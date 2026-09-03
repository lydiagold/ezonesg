/* ============================================================================
 *  ⚠️  DEVELOPMENT SEED DATA — NOT REAL EZONE INVENTORY OR PRICING  ⚠️
 * ----------------------------------------------------------------------------
 *  Every product, price, SKU and stock level below is illustrative placeholder
 *  data used only to build and demo the Phase 1 storefront. Prices are NOT
 *  Apple's or EZONE's real prices. Real catalogue + pricing is maintained by an
 *  admin against DynamoDB from Phase 3 onward (this file is then unused).
 * ========================================================================== */

import { Product, ProductVariant, ProductImage } from '../models/product.model';

const SEED_NOTE = 'SEED DATA — illustrative only, not real pricing.';

const NOW = '2026-01-01T00:00:00.000Z';

function img(src: string, alt: string): ProductImage {
  return { key: src, url: src, alt, primary: true, sort: 0 };
}

/** Cartesian product of attribute dimensions → variants, with per-config pricing. */
function buildVariants(
  baseSku: string,
  dims: { name: string; values: string[] }[],
  opts: {
    basePrice: number;
    baseStock: number;
    /** Extra price (SGD) added per selected attribute value. */
    upcharge?: Record<string, number>;
    /** Attribute values that should read as out-of-stock, for demo realism. */
    outOfStock?: string[];
  }
): ProductVariant[] {
  const combos = dims.reduce<Record<string, string>[]>(
    (acc, dim) =>
      acc.flatMap(row => dim.values.map(v => ({ ...row, [dim.name]: v }))),
    [{}]
  );

  return combos.map((attributes, i) => {
    const upcharge = Object.values(attributes).reduce(
      (sum, val) => sum + (opts.upcharge?.[val] ?? 0),
      0
    );
    // Absolute variant price = base + upcharge; only set when it differs so
    // base-config variants fall back to the product's list price.
    const priceOverride = upcharge > 0 ? opts.basePrice + upcharge : undefined;
    const oos = Object.values(attributes).some(v => opts.outOfStock?.includes(v));
    const skuSuffix = Object.values(attributes)
      .map(v => v.replace(/[^A-Za-z0-9]/g, '').slice(0, 4).toUpperCase())
      .join('-');
    return {
      id: `${baseSku}-${i + 1}`,
      sku: `${baseSku}-${skuSuffix || 'STD'}`,
      attributes,
      priceOverride,
      stockQuantity: oos ? 0 : opts.baseStock,
      active: true,
    };
  });
}

const PHONE_IMG = 'assets/images/seed/phone.svg';
const TABLET_IMG = 'assets/images/seed/tablet.svg';
const ACC_IMG = 'assets/images/seed/accessory.svg';

/** Shared upcharge table for iPhone storage tiers (illustrative). */
const STORAGE_UPCHARGE = { '128GB': 0, '256GB': 150, '512GB': 400, '1TB': 700 };

interface PhoneSeed {
  slug: string;
  name: string;
  base: number;
  storages: string[];
  colours: string[];
  chip: string;
  display: string;
  featured?: boolean;
  salePrice?: number;
  originalPrice?: number;
}

function iphone(p: PhoneSeed): Product {
  const sku = p.slug.toUpperCase().replace(/-/g, '');
  return {
    id: p.slug,
    slug: p.slug,
    sku,
    name: p.name,
    brand: 'Apple',
    category: 'phones',
    shortDescription: `${p.display} · ${p.chip}`,
    description: `${SEED_NOTE} The ${p.name} featuring the ${p.chip} chip and a ${p.display} display. Configure storage and colour below.`,
    price: p.base,
    originalPrice: p.originalPrice,
    salePrice: p.salePrice,
    currency: 'SGD',
    images: [img(PHONE_IMG, `${p.name} (seed image)`)],
    attributes: {
      Display: p.display,
      Chip: p.chip,
      'Operating System': 'iOS',
      Warranty: '1-year limited warranty',
    },
    variants: buildVariants(sku, [
      { name: 'Storage', values: p.storages },
      { name: 'Colour', values: p.colours },
    ], { basePrice: p.base, baseStock: 12, upcharge: STORAGE_UPCHARGE, outOfStock: ['1TB'] }),
    featured: !!p.featured,
    active: true,
    createdAt: NOW,
    updatedAt: NOW,
  };
}

const IPHONES: Product[] = [
  iphone({ slug: 'iphone-15', name: 'iPhone 15', base: 1299, storages: ['128GB', '256GB', '512GB'], colours: ['Black', 'Blue', 'Pink'], chip: 'A16 Bionic', display: '6.1-inch OLED' }),
  iphone({ slug: 'iphone-15-plus', name: 'iPhone 15 Plus', base: 1499, storages: ['128GB', '256GB', '512GB'], colours: ['Black', 'Blue', 'Green'], chip: 'A16 Bionic', display: '6.7-inch OLED' }),
  iphone({ slug: 'iphone-15-pro', name: 'iPhone 15 Pro', base: 1699, storages: ['128GB', '256GB', '512GB', '1TB'], colours: ['Natural Titanium', 'Black Titanium', 'White Titanium'], chip: 'A17 Pro', display: '6.1-inch ProMotion OLED', featured: true }),
  iphone({ slug: 'iphone-15-pro-max', name: 'iPhone 15 Pro Max', base: 1999, storages: ['256GB', '512GB', '1TB'], colours: ['Natural Titanium', 'Blue Titanium', 'White Titanium'], chip: 'A17 Pro', display: '6.7-inch ProMotion OLED' }),
  iphone({ slug: 'iphone-16', name: 'iPhone 16', base: 1399, storages: ['128GB', '256GB', '512GB'], colours: ['Black', 'White', 'Ultramarine'], chip: 'A18', display: '6.1-inch OLED', featured: true, originalPrice: 1499, salePrice: 1399 }),
  iphone({ slug: 'iphone-16-plus', name: 'iPhone 16 Plus', base: 1599, storages: ['128GB', '256GB', '512GB'], colours: ['Black', 'White', 'Teal'], chip: 'A18', display: '6.7-inch OLED' }),
  iphone({ slug: 'iphone-16-pro', name: 'iPhone 16 Pro', base: 1799, storages: ['128GB', '256GB', '512GB', '1TB'], colours: ['Natural Titanium', 'Black Titanium', 'Desert Titanium'], chip: 'A18 Pro', display: '6.3-inch ProMotion OLED', featured: true }),
  iphone({ slug: 'iphone-16-pro-max', name: 'iPhone 16 Pro Max', base: 2099, storages: ['256GB', '512GB', '1TB'], colours: ['Natural Titanium', 'Black Titanium', 'Desert Titanium'], chip: 'A18 Pro', display: '6.9-inch ProMotion OLED', featured: true }),
];

interface TabletSeed {
  slug: string;
  name: string;
  base: number;
  screen: string;
  storages: string[];
  rams: string[];
  connectivity: string[];
  colours: string[];
  featured?: boolean;
}

function ezoneTablet(t: TabletSeed): Product {
  const sku = t.slug.toUpperCase().replace(/-/g, '');
  return {
    id: t.slug,
    slug: t.slug,
    sku,
    name: t.name,
    brand: 'EZONE',
    category: 'tablets',
    shortDescription: `${t.screen} Android tablet`,
    description: `${SEED_NOTE} The ${t.name} — a ${t.screen} EZONE Android tablet. Configure RAM, storage, connectivity and colour below.`,
    price: t.base,
    currency: 'SGD',
    images: [img(TABLET_IMG, `${t.name} (seed image)`)],
    attributes: {
      'Screen Size': t.screen,
      'Operating System': 'Android 14',
      Battery: '7,000 mAh',
      Camera: '13MP rear · 8MP front',
      Warranty: '1-year EZONE warranty',
    },
    variants: buildVariants(sku, [
      { name: 'RAM', values: t.rams },
      { name: 'Storage', values: t.storages },
      { name: 'Connectivity', values: t.connectivity },
      { name: 'Colour', values: t.colours },
    ], {
      basePrice: t.base,
      baseStock: 20,
      upcharge: { '8GB': 60, '128GB': 40, '256GB': 120, LTE: 80 },
    }),
    featured: !!t.featured,
    active: true,
    createdAt: NOW,
    updatedAt: NOW,
  };
}

const EZONE_TABLETS: Product[] = [
  ezoneTablet({ slug: 'ezone-tablet-8', name: 'EZONE Tablet 8"', base: 249, screen: '8-inch HD', rams: ['4GB', '8GB'], storages: ['64GB', '128GB'], connectivity: ['WiFi', 'LTE'], colours: ['Space Grey', 'Silver'], featured: true }),
  ezoneTablet({ slug: 'ezone-tablet-10', name: 'EZONE Tablet 10"', base: 349, screen: '10.1-inch FHD', rams: ['4GB', '8GB'], storages: ['128GB', '256GB'], connectivity: ['WiFi', 'LTE'], colours: ['Space Grey', 'Silver'], featured: true }),
  ezoneTablet({ slug: 'ezone-tablet-11', name: 'EZONE Tablet 11"', base: 449, screen: '11-inch 2K', rams: ['8GB'], storages: ['128GB', '256GB'], connectivity: ['WiFi', 'LTE'], colours: ['Space Grey', 'Silver'] }),
];

/** Accessory with NO variant dimensions — a single default variant carries stock. */
const ACCESSORIES: Product[] = [
  {
    id: 'usb-c-fast-charger-30w',
    slug: 'usb-c-fast-charger-30w',
    sku: 'ACC-CHG-30W',
    name: 'EZONE 30W USB-C Fast Charger',
    brand: 'EZONE',
    category: 'accessories',
    shortDescription: 'Compact 30W USB-C power adapter',
    description: `${SEED_NOTE} A compact 30W USB-C fast charger compatible with iPhones and EZONE tablets. Cable sold separately.`,
    price: 29,
    originalPrice: 39,
    salePrice: 29,
    currency: 'SGD',
    images: [img(ACC_IMG, 'EZONE 30W USB-C Fast Charger (seed image)')],
    attributes: {
      Output: '30W USB-C Power Delivery',
      Compatibility: 'iPhone, EZONE Tablet, USB-C devices',
      Warranty: '1-year EZONE warranty',
    },
    variants: [
      {
        id: 'ACC-CHG-30W-1',
        sku: 'ACC-CHG-30W',
        attributes: {},
        stockQuantity: 60,
        active: true,
      },
    ],
    featured: true,
    active: true,
    createdAt: NOW,
    updatedAt: NOW,
  },
];

export const SEED_PRODUCTS: Product[] = [
  ...IPHONES,
  ...EZONE_TABLETS,
  ...ACCESSORIES,
];
