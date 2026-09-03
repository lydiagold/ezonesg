/**
 * DEV SEED SCRIPT — loads clearly-marked placeholder products + categories into
 * DynamoDB so the Phase 2 API can be exercised. NOT real EZONE inventory/pricing.
 *
 * Usage (after `terraform apply` exports the table names):
 *   npm i @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb   # local only
 *   PRODUCTS_TABLE=ezone-products-dev CATEGORIES_TABLE=ezone-categories-dev \
 *   SETTINGS_TABLE=ezone-settings-dev AWS_REGION=ap-southeast-1 npm run seed
 *
 * Real catalogue is maintained by an admin from Phase 3 onward.
 */
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}), {
  marshallOptions: { removeUndefinedValues: true },
});

const PRODUCTS_TABLE = requireEnv('PRODUCTS_TABLE');
const CATEGORIES_TABLE = requireEnv('CATEGORIES_TABLE');
const NOW = new Date().toISOString();

function requireEnv(name) {
  const v = process.env[name];
  if (!v) { console.error(`Missing env var ${name}`); process.exit(1); }
  return v;
}

const CATEGORIES = [
  { slug: 'phones', name: 'iPhones', tagline: 'The latest Apple iPhone lineup.', route: '/shop/phones', sort: 1 },
  { slug: 'tablets', name: 'Tablets', tagline: 'EZONE and Android tablets for work and play.', route: '/shop/tablets', sort: 2 },
  { slug: 'accessories', name: 'Accessories', tagline: 'Chargers, cases and essentials.', route: '/shop/accessories', sort: 3 },
];

function variant(id, sku, attributes, stockQuantity, priceOverride) {
  return { id, sku, attributes, stockQuantity, priceOverride, active: true };
}

// A compact representative subset — enough to test list/detail/checkout.
const PRODUCTS = [
  {
    id: 'iphone-16-pro', slug: 'iphone-16-pro', sku: 'IPHONE16PRO',
    name: 'iPhone 16 Pro', brand: 'Apple', category: 'phones',
    shortDescription: '6.3-inch ProMotion OLED · A18 Pro',
    description: 'SEED DATA — illustrative only. iPhone 16 Pro with the A18 Pro chip.',
    price: 1799, currency: 'SGD',
    images: [{ key: 'assets/images/seed/phone.svg', url: 'assets/images/seed/phone.svg', alt: 'iPhone 16 Pro (seed image)', primary: true, sort: 0 }],
    attributes: { Display: '6.3-inch ProMotion OLED', Chip: 'A18 Pro', 'Operating System': 'iOS', Warranty: '1-year limited warranty' },
    variants: [
      variant('IPHONE16PRO-1', 'IPHONE16PRO-128-NAT', { Storage: '128GB', Colour: 'Natural Titanium' }, 12),
      variant('IPHONE16PRO-2', 'IPHONE16PRO-256-NAT', { Storage: '256GB', Colour: 'Natural Titanium' }, 8, 1949),
      variant('IPHONE16PRO-3', 'IPHONE16PRO-256-BLK', { Storage: '256GB', Colour: 'Black Titanium' }, 5, 1949),
    ],
    featured: true, active: true, createdAt: NOW, updatedAt: NOW,
  },
  {
    id: 'ezone-tablet-10', slug: 'ezone-tablet-10', sku: 'EZONETABLET10',
    name: 'EZONE Tablet 10"', brand: 'EZONE', category: 'tablets',
    shortDescription: '10.1-inch FHD Android tablet',
    description: 'SEED DATA — illustrative only. EZONE Tablet 10" Android tablet.',
    price: 349, currency: 'SGD',
    images: [{ key: 'assets/images/seed/tablet.svg', url: 'assets/images/seed/tablet.svg', alt: 'EZONE Tablet 10 (seed image)', primary: true, sort: 0 }],
    attributes: { 'Screen Size': '10.1-inch FHD', 'Operating System': 'Android 14', Battery: '7,000 mAh', Warranty: '1-year EZONE warranty' },
    variants: [
      variant('EZONETABLET10-1', 'EZONETABLET10-4-128-WIFI', { RAM: '4GB', Storage: '128GB', Connectivity: 'WiFi' }, 20),
      variant('EZONETABLET10-2', 'EZONETABLET10-8-256-LTE', { RAM: '8GB', Storage: '256GB', Connectivity: 'LTE' }, 15, 489),
    ],
    featured: true, active: true, createdAt: NOW, updatedAt: NOW,
  },
  {
    id: 'usb-c-fast-charger-30w', slug: 'usb-c-fast-charger-30w', sku: 'ACC-CHG-30W',
    name: 'EZONE 30W USB-C Fast Charger', brand: 'EZONE', category: 'accessories',
    shortDescription: 'Compact 30W USB-C power adapter',
    description: 'SEED DATA — illustrative only. 30W USB-C fast charger.',
    price: 29, originalPrice: 39, salePrice: 29, currency: 'SGD',
    images: [{ key: 'assets/images/seed/accessory.svg', url: 'assets/images/seed/accessory.svg', alt: 'EZONE 30W USB-C Fast Charger (seed image)', primary: true, sort: 0 }],
    attributes: { Output: '30W USB-C Power Delivery', Warranty: '1-year EZONE warranty' },
    variants: [variant('ACC-CHG-30W-1', 'ACC-CHG-30W', {}, 60)],
    featured: true, active: true, createdAt: NOW, updatedAt: NOW,
  },
];

async function run() {
  for (const c of CATEGORIES) {
    await ddb.send(new PutCommand({ TableName: CATEGORIES_TABLE, Item: c }));
    console.log(`category: ${c.slug}`);
  }
  for (const p of PRODUCTS) {
    await ddb.send(new PutCommand({ TableName: PRODUCTS_TABLE, Item: p }));
    console.log(`product:  ${p.slug}`);
  }
  console.log('\nSeed complete (SEED DATA — not real inventory).');
}

run().catch(err => { console.error(err); process.exit(1); });
