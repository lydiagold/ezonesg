import { randomUUID } from 'node:crypto';
import { GetCommand, PutCommand, ScanCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { ddb, TABLES } from '../../lib/db.js';
import { ok, created, HttpError, parseBody } from '../../lib/http.js';
import { audit } from '../../lib/audit.js';
import { presignGet } from '../../lib/s3.js';

const CATEGORIES = ['phones', 'tablets', 'accessories'];

/** GET /api/admin/products — every product, including inactive/archived. */
export async function adminListProducts() {
  const res = await ddb.send(new ScanCommand({ TableName: TABLES.products }));
  const items = (res.Items ?? []).sort((a, b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? ''));
  return ok(items);
}

/** GET /api/admin/products/{id} — full product with presigned image URLs. */
export async function adminGetProduct(id) {
  const product = await loadProduct(id);
  return ok(await withImageUrls(product));
}

/** POST /api/admin/products */
export async function adminCreateProduct(event, actor) {
  const body = parseBody(event);
  const now = new Date().toISOString();
  const id = body.id?.trim() || slugify(body.name) || randomUUID();

  const existing = await ddb.send(new GetCommand({ TableName: TABLES.products, Key: { id } }));
  if (existing.Item) throw new HttpError(409, 'A product with this id already exists');

  const product = normalizeProduct(body, { id, createdAt: now, updatedAt: now });

  await ddb.send(new PutCommand({
    TableName: TABLES.products,
    Item: product,
    ConditionExpression: 'attribute_not_exists(id)',
  }));

  await audit(actor, { action: 'PRODUCT_CREATED', entity: 'product', entityId: id, details: { name: product.name, price: product.price } });
  return created(product);
}

/** PUT /api/admin/products/{id} */
export async function adminUpdateProduct(event, actor, id) {
  const prev = await loadProduct(id);
  const body = parseBody(event);
  const now = new Date().toISOString();

  const product = normalizeProduct({ ...prev, ...body }, {
    id,
    createdAt: prev.createdAt ?? now,
    updatedAt: now,
  });

  await ddb.send(new PutCommand({ TableName: TABLES.products, Item: product }));

  // Price changes are individually auditable per the spec.
  if (prev.price !== product.price || prev.salePrice !== product.salePrice) {
    await audit(actor, {
      action: 'PRODUCT_PRICE_CHANGED',
      entity: 'product',
      entityId: id,
      details: { from: { price: prev.price, salePrice: prev.salePrice }, to: { price: product.price, salePrice: product.salePrice } },
    });
  }
  await audit(actor, { action: 'PRODUCT_UPDATED', entity: 'product', entityId: id, details: { name: product.name } });
  return ok(product);
}

/**
 * DELETE /api/admin/products/{id} — archive (soft). Orders reference product
 * snapshots, so we never hard-delete catalogue history. ?hard=true is rejected.
 */
export async function adminArchiveProduct(event, actor, id) {
  const prev = await loadProduct(id);
  const now = new Date().toISOString();
  const product = { ...prev, active: false, archived: true, updatedAt: now };
  await ddb.send(new PutCommand({ TableName: TABLES.products, Item: product }));
  await audit(actor, { action: 'PRODUCT_ARCHIVED', entity: 'product', entityId: id, details: { name: prev.name } });
  return ok(product);
}

// --- helpers ---------------------------------------------------------------

async function loadProduct(id) {
  const res = await ddb.send(new GetCommand({ TableName: TABLES.products, Key: { id } }));
  if (!res.Item) throw new HttpError(404, 'Product not found');
  return res.Item;
}

async function withImageUrls(product) {
  const images = await Promise.all((product.images ?? []).map(async img => ({
    ...img,
    // Presign private S3 keys for admin preview; leave local/asset paths as-is.
    url: img.key && !img.key.startsWith('assets/') ? await presignGet(img.key) : img.url,
  })));
  return { ...product, images };
}

function normalizeProduct(input, overrides) {
  const name = req(input.name, 'name');
  const category = input.category;
  if (!CATEGORIES.includes(category)) throw new HttpError(400, `category must be one of ${CATEGORIES.join(', ')}`);

  const price = num(input.price, 'price');
  const variants = normalizeVariants(input.variants);

  return {
    id: overrides.id,
    slug: (input.slug?.trim() || slugify(name)),
    sku: str(input.sku) || slugify(name).toUpperCase().replace(/-/g, ''),
    name,
    brand: str(input.brand),
    category,
    description: str(input.description),
    shortDescription: str(input.shortDescription),
    price,
    originalPrice: optNum(input.originalPrice),
    salePrice: optNum(input.salePrice),
    currency: 'SGD',
    images: normalizeImages(input.images),
    attributes: obj(input.attributes),
    variants,
    featured: Boolean(input.featured),
    active: input.active !== false,
    archived: Boolean(input.archived),
    seoTitle: str(input.seoTitle),
    seoDescription: str(input.seoDescription),
    createdAt: overrides.createdAt,
    updatedAt: overrides.updatedAt,
  };
}

function normalizeVariants(variants) {
  if (!Array.isArray(variants) || variants.length === 0) {
    throw new HttpError(400, 'At least one variant is required (a simple product has one)');
  }
  return variants.map((v, i) => {
    const sku = str(v.sku);
    if (!sku) throw new HttpError(400, `variant ${i + 1} is missing a SKU`);
    return {
      id: str(v.id) || randomUUID(),
      sku,
      attributes: obj(v.attributes),
      priceOverride: optNum(v.priceOverride),
      stockQuantity: Math.max(0, Math.trunc(Number(v.stockQuantity) || 0)),
      lowStockThreshold: v.lowStockThreshold != null ? Math.max(0, Math.trunc(Number(v.lowStockThreshold))) : 3,
      active: v.active !== false,
    };
  });
}

function normalizeImages(images) {
  if (!Array.isArray(images)) return [];
  return images.map((img, i) => ({
    key: str(img.key),
    url: str(img.url),
    alt: str(img.alt),
    primary: Boolean(img.primary),
    sort: img.sort != null ? Number(img.sort) : i,
  }));
}

function slugify(s) {
  return String(s || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}
const req = (v, f) => { const s = str(v); if (!s) throw new HttpError(400, `${f} is required`); return s; };
const str = v => (v == null ? '' : String(v).trim());
const obj = v => (v && typeof v === 'object' && !Array.isArray(v) ? v : {});
const num = (v, f) => { const n = Number(v); if (!Number.isFinite(n) || n < 0) throw new HttpError(400, `${f} must be a non-negative number`); return n; };
const optNum = v => { if (v == null || v === '') return undefined; const n = Number(v); return Number.isFinite(n) && n >= 0 ? n : undefined; };
