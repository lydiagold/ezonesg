import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { ddb, TABLES } from './db.js';

/**
 * Store configuration lives as documents in the settings table, one item per
 * config key. Cheapest possible: no new tables, no CMS. Keys used:
 *   homepage  → HomepageConfig (hero, sections, banners, category cards, …)
 *   business  → BusinessSettings (contact, address, hours, GST)
 *   delivery  → DeliverySettings (fees, thresholds, pickup)
 *
 * The public API returns only whitelisted, non-sensitive fields (see routes).
 */
export async function getConfig(key, fallback = null) {
  const res = await ddb.send(new GetCommand({ TableName: TABLES.settings, Key: { key } }));
  return res.Item?.value ?? fallback;
}

export async function putConfig(key, value) {
  const now = new Date().toISOString();
  await ddb.send(new PutCommand({
    TableName: TABLES.settings,
    Item: { key, value, updatedAt: now },
  }));
  return value;
}

/**
 * Default homepage configuration — the storefront's current content, expressed as
 * data. Seeded on first read so the admin editor and public homepage are never
 * empty before an admin saves anything. Editing these requires NO code change.
 */
export const DEFAULT_HOMEPAGE = {
  hero: {
    active: true,
    eyebrow: 'New · iPhone Series',
    heading: 'Singapore electronics, made simple.',
    description: 'Genuine phones, EZONE tablets and everyday tech — delivered fast across Singapore.',
    primaryLabel: 'Shop iPhones',
    primaryUrl: '/shop/phones',
    secondaryLabel: 'Shop Tablets',
    secondaryUrl: '/shop/tablets',
    desktopImageKey: '',
    mobileImageKey: '',
  },
  categoryCards: {
    active: true,
    heading: 'Shop by category',
    items: [
      { title: 'iPhones', subtitle: 'The latest Apple lineup', imageKey: '', url: '/shop/phones', order: 1, active: true },
      { title: 'Tablets', subtitle: 'EZONE & Android tablets', imageKey: '', url: '/shop/tablets', order: 2, active: true },
      { title: 'Accessories', subtitle: 'Chargers, cases & essentials', imageKey: '', url: '/shop/accessories', order: 3, active: true },
    ],
  },
  featured: {
    active: true,
    heading: 'Featured',
    description: 'Hand-picked by the EZONE team.',
    // Ordered product ids; falls back to product.featured flag when empty.
    productIds: [],
  },
  banners: {
    active: true,
    items: [],
  },
  whyShop: {
    active: true,
    heading: 'Why shop with EZONE',
    items: [
      { title: 'Genuine products', description: 'Sourced from authorised channels.', icon: 'shield-check', order: 1, active: true },
      { title: 'Fast SG delivery', description: 'Islandwide, quickly.', icon: 'truck', order: 2, active: true },
      { title: 'Secure checkout', description: 'Protected payments via HitPay.', icon: 'lock', order: 3, active: true },
      { title: 'Real support', description: 'Talk to a real person.', icon: 'chat', order: 4, active: true },
    ],
  },
  contactCta: {
    active: true,
    heading: 'Questions? Talk to us.',
    description: 'Message us on WhatsApp for quick help with any order.',
    whatsappEnabled: true,
    contactEnabled: true,
  },
  // Section order + on/off for the whole homepage.
  sections: [
    { key: 'hero', order: 1, active: true },
    { key: 'categoryCards', order: 2, active: true },
    { key: 'featured', order: 3, active: true },
    { key: 'banners', order: 4, active: true },
    { key: 'whyShop', order: 5, active: true },
    { key: 'contactCta', order: 6, active: true },
  ],
};

export const DEFAULT_BUSINESS = {
  displayName: 'EZONE',
  legalName: 'Ezone SG',
  supportEmail: 'sales@ezone.sg',
  supportMobile: '+65 6000 0000',
  whatsappNumber: '+6580000000',
  businessHours: 'Mon–Sat, 10am – 8pm (SGT)',
  storeAddress: '1 Marina Boulevard, #00-00, Singapore 018989',
  pickupAddress: '1 Marina Boulevard, #00-00, Singapore 018989',
  pickupInstructions: 'Collection by appointment. Please bring your order reference.',
  gstRegistered: false,
  gstNumber: '',
  // Store policies (shown on the storefront; editable under Settings → Policies).
  returnPolicy: '',
  warrantyPolicy: '',
  deliveryPolicy: '',
  privacyNote: '',
};

export const DEFAULT_DELIVERY = {
  standardDeliveryFee: 8,
  freeDeliveryThreshold: 500,
  pickupEnabled: true,
  deliveryEnabled: true,
};
