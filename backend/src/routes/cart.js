import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'node:crypto';
import { ddb, TABLES } from '../lib/db.js';
import { ok, created, notFound, HttpError, parseBody } from '../lib/http.js';

/**
 * Server-side cart / order-draft (status = CART).
 *
 * Self-contained module (no edits to shared router/lib files). Wire it into the
 * main router with:
 *
 *   if (path === '/api/v1/carts' || path.startsWith('/api/v1/carts/'))
 *     return await handleCart(event, method, path.slice('/api/v1/carts'.length));
 *
 * Design rules honoured:
 * - Carts are referenced by a strong OPAQUE token, never a sequential id.
 * - The client sends only { productId, variantId, quantity }; the SERVER resolves
 *   name/sku/price authoritatively from the products table (never trusts client price).
 * - No real Order is created here — conversion happens later at payment.
 * - A DynamoDB TTL (`ttl`, epoch seconds) auto-expires abandoned carts (~$0).
 */

// Carts table name; derived from the products table name if not set explicitly,
// so this module needs no change to the shared lambda env wiring to be added.
const CARTS_TABLE =
  process.env.CARTS_TABLE ||
  (TABLES.products ? TABLES.products.replace(/products/, 'carts') : undefined);

const TTL_DAYS = 7;

export async function handleCart(event, method, sub) {
  // sub is the path after '/api/v1/carts' — '', '/{token}', '/{token}/items', ...
  const path = sub.replace(/\/+$/, '');

  if (path === '' && method === 'POST') return createCart(event);

  const cartMatch = path.match(/^\/([^/]+)$/);
  if (cartMatch) {
    const token = decodeURIComponent(cartMatch[1]);
    if (method === 'GET') return getCart(token);
    if (method === 'PATCH') return patchCart(token, event);
  }

  const itemsMatch = path.match(/^\/([^/]+)\/items$/);
  if (itemsMatch && method === 'POST') {
    return addItem(decodeURIComponent(itemsMatch[1]), event);
  }

  const itemMatch = path.match(/^\/([^/]+)\/items\/([^/]+)$/);
  if (itemMatch) {
    const token = decodeURIComponent(itemMatch[1]);
    const itemId = decodeURIComponent(itemMatch[2]);
    if (method === 'PATCH') return updateItem(token, itemId, event);
    if (method === 'DELETE') return removeItem(token, itemId);
  }

  return notFound('Cart route not found');
}

// ---- handlers ----

async function createCart(event) {
  const body = parseBody(event);
  const customer = sanitizeCustomer(body.customer);
  const terms = sanitizeTerms(body.terms);
  const inputItems = Array.isArray(body.items) ? body.items : [];

  const items = [];
  for (const line of inputItems) items.push(await resolveItem(line));

  const token = opaqueToken();
  const now = new Date();
  const cart = freshCart(token, now, { customer, terms, items });
  await put(cart);
  return created(publicView(cart));
}

async function getCart(token) {
  const cart = await load(token);
  if (!cart) return notFound('Cart not found');
  return ok(publicView(cart));
}

async function patchCart(token, event) {
  const cart = await load(token);
  if (!cart) return notFound('Cart not found');
  const body = parseBody(event);
  const customer = sanitizeCustomer(body.customer);
  const terms = sanitizeTerms(body.terms);
  if (customer) cart.customer = customer;
  if (terms) Object.assign(cart, terms);
  await touch(cart);
  return ok(publicView(cart));
}

async function addItem(token, event) {
  const cart = await load(token);
  if (!cart) return notFound('Cart not found');
  const resolved = await resolveItem(parseBody(event));
  const existing = cart.items.find(
    i => i.productId === resolved.productId && i.variantId === resolved.variantId
  );
  if (existing) {
    existing.quantity += resolved.quantity;
    existing.lineTotal = existing.unitPrice * existing.quantity;
  } else {
    cart.items.push(resolved);
  }
  await touch(cart);
  return ok(publicView(cart));
}

async function updateItem(token, itemId, event) {
  const cart = await load(token);
  if (!cart) return notFound('Cart not found');
  const body = parseBody(event);
  const quantity = Number(body.quantity);
  if (!Number.isInteger(quantity)) throw new HttpError(400, 'Invalid quantity');
  const it = cart.items.find(i => i.itemId === itemId);
  if (!it) return notFound('Item not found');
  if (quantity <= 0) {
    cart.items = cart.items.filter(i => i.itemId !== itemId);
  } else {
    // Re-validate stock against the catalogue before increasing.
    const { variant } = await loadProductVariant(it.productId, it.variantId);
    if (variant.stockQuantity < quantity) throw new HttpError(409, 'Insufficient stock');
    it.quantity = quantity;
    it.lineTotal = it.unitPrice * quantity;
  }
  await touch(cart);
  return ok(publicView(cart));
}

async function removeItem(token, itemId) {
  const cart = await load(token);
  if (!cart) return notFound('Cart not found');
  cart.items = cart.items.filter(i => i.itemId !== itemId);
  await touch(cart);
  return ok(publicView(cart));
}

// ---- authoritative resolution ----

async function loadProductVariant(productId, variantId) {
  const res = await ddb.send(new GetCommand({ TableName: TABLES.products, Key: { id: productId } }));
  const product = res.Item;
  if (!product || product.active === false) throw new HttpError(409, 'Product no longer available');
  const variant = (product.variants ?? []).find(v => v.id === variantId && v.active !== false);
  if (!variant) throw new HttpError(409, 'Selected option no longer available');
  return { product, variant };
}

async function resolveItem(line) {
  if (!line || !line.productId || !line.variantId) throw new HttpError(400, 'Invalid cart item');
  const quantity = Number(line.quantity);
  if (!Number.isInteger(quantity) || quantity < 1) throw new HttpError(400, 'Invalid quantity');

  const { product, variant } = await loadProductVariant(line.productId, line.variantId);
  if ((variant.stockQuantity ?? 0) < quantity) throw new HttpError(409, `Insufficient stock for ${product.name}`);

  const unitPrice = variant.priceOverride ?? product.salePrice ?? product.price;
  const variantDescription = Object.entries(variant.attributes ?? {})
    .map(([k, v]) => `${k}: ${v}`)
    .join(', ');

  return {
    itemId: randomUUID(),
    productId: product.id,
    variantId: variant.id,
    quantity,
    productName: product.name,
    slug: product.slug,
    sku: variant.sku,
    variantDescription,
    unitPrice,
    lineTotal: unitPrice * quantity,
    image: product.images?.[0]?.url ?? '',
  };
}

// ---- storage & shaping ----

function opaqueToken() {
  return `ez_${randomUUID().replace(/-/g, '')}${randomUUID().replace(/-/g, '').slice(0, 12)}`;
}

function freshCart(token, now, { customer, terms, items }) {
  const expires = new Date(now.getTime() + TTL_DAYS * 86400_000);
  return {
    cartToken: token,
    id: token,
    status: 'CART',
    customer,
    ...(terms ?? {}),
    items,
    subtotal: subtotalOf(items),
    currency: 'SGD',
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    expiresAt: expires.toISOString(),
    ttl: Math.floor(expires.getTime() / 1000), // DynamoDB TTL attribute (epoch seconds)
  };
}

function subtotalOf(items) {
  return items.reduce((s, i) => s + i.lineTotal, 0);
}

async function load(token) {
  if (!token) return undefined;
  const res = await ddb.send(new GetCommand({ TableName: CARTS_TABLE, Key: { cartToken: token } }));
  const cart = res.Item;
  if (!cart) return undefined;
  // TTL deletion can lag; treat an expired cart as gone.
  if (cart.ttl && cart.ttl * 1000 < Date.now()) return undefined;
  return cart;
}

async function touch(cart) {
  const now = new Date();
  const expires = new Date(now.getTime() + TTL_DAYS * 86400_000);
  cart.subtotal = subtotalOf(cart.items);
  cart.updatedAt = now.toISOString();
  cart.expiresAt = expires.toISOString();
  cart.ttl = Math.floor(expires.getTime() / 1000); // sliding expiry on activity
  await put(cart);
}

async function put(cart) {
  await ddb.send(new PutCommand({ TableName: CARTS_TABLE, Item: cart }));
}

/** Only ever accept these customer fields (mass-assignment guard). */
function sanitizeCustomer(c) {
  if (!c) return undefined;
  const name = String(c.name ?? '').trim();
  const email = String(c.email ?? '').trim();
  const mobile = String(c.mobile ?? '').trim();
  if (!name || !email || !mobile) return undefined;
  return { name, email, mobile };
}

function sanitizeTerms(t) {
  if (!t) return undefined;
  return {
    termsAcceptedAt: String(t.termsAcceptedAt ?? ''),
    termsVersion: String(t.termsVersion ?? ''),
    privacyAcceptedAt: String(t.privacyAcceptedAt ?? ''),
    privacyVersion: String(t.privacyVersion ?? ''),
  };
}

/** Shape returned to the browser (drops the raw ttl attribute). */
function publicView(cart) {
  const { ttl, ...view } = cart;
  view.opaqueToken = cart.cartToken;
  return view;
}
