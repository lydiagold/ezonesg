import { QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { ddb, TABLES } from '../lib/db.js';
import { ok, notFound } from '../lib/http.js';

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
  return ok(item);
}
