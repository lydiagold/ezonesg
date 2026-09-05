import { QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { ddb, TABLES } from '../lib/db.js';
import { ok, notFound } from '../lib/http.js';
import { presignGet } from '../lib/s3.js';

// Product images live as private S3 objects (key). We never persist a presigned
// URL (it expires); instead we mint a fresh, longer-lived GET URL per response
// from the stored key — same approach as the public homepage route. Seed/local
// asset paths (assets/...) are passed through untouched.
const IMAGE_TTL = 6 * 3600;

async function withFreshImageUrls(product) {
  if (!product?.images?.length) return product;
  const images = await Promise.all(product.images.map(async img => {
    if (img.key && !img.key.startsWith('assets/')) {
      return { ...img, url: await presignGet(img.key, IMAGE_TTL) };
    }
    return img;
  }));
  return { ...product, images };
}

/** GET /api/products?category=phones&q=iphone — list active products. */
export async function listProducts(event) {
  const category = event.queryStringParameters?.category;
  const q = (event.queryStringParameters?.q || '').toLowerCase().trim();

  let items;
  if (category) {
    const res = await ddb.send(new QueryCommand({
      TableName: TABLES.products,
      IndexName: 'category-index',
      KeyConditionExpression: '#c = :c',
      ExpressionAttributeNames: { '#c': 'category' },
      ExpressionAttributeValues: { ':c': category },
    }));
    items = res.Items ?? [];
  } else {
    // Small catalogue — a Scan is cheaper and simpler than maintaining a hot GSI.
    const res = await ddb.send(new ScanCommand({ TableName: TABLES.products }));
    items = res.Items ?? [];
  }

  items = items.filter(p => p.active !== false);

  if (q) {
    items = items.filter(p =>
      [p.name, p.brand, p.sku, p.category, ...(p.variants ?? []).map(v => v.sku)]
        .join(' ').toLowerCase().includes(q)
    );
  }

  items = await Promise.all(items.map(withFreshImageUrls));
  return ok(items);
}

/** GET /api/products/{slug} — single product by slug. */
export async function getProductBySlug(slug) {
  const res = await ddb.send(new QueryCommand({
    TableName: TABLES.products,
    IndexName: 'slug-index',
    KeyConditionExpression: 'slug = :s',
    ExpressionAttributeValues: { ':s': slug },
    Limit: 1,
  }));
  const item = res.Items?.[0];
  if (!item || item.active === false) return notFound('Product not found');
  return ok(await withFreshImageUrls(item));
}
