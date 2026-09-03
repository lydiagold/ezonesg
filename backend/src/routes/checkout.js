import { GetCommand, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { ddb, TABLES } from '../lib/db.js';
import { created, HttpError, parseBody } from '../lib/http.js';

const DELIVERY_FEE = 8;
const FREE_DELIVERY_THRESHOLD = 500;

function deliveryFeeFor(subtotal) {
  if (subtotal <= 0) return 0;
  return subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
}

function effectiveUnitPrice(product, variant) {
  if (variant.priceOverride != null) return variant.priceOverride;
  return product.salePrice ?? product.price;
}

/**
 * POST /api/checkout
 *
 * The browser sends ONLY what to buy (product/variant/qty) plus customer details.
 * The server recomputes the authoritative total from the catalogue and validates
 * stock — the client amount is never trusted. The order is created PENDING_PAYMENT.
 *
 * NOTE: HitPay payment creation and the atomic stock decrement happen in Phase 4
 * (the verified webhook is the sole authority for the PAID transition). Until then
 * this returns a storefront return URL so the flow is exercisable end to end.
 */
export async function checkout(event, storefrontOrigin) {
  const body = parseBody(event);

  const { customerName, customerEmail, customerMobile, shippingAddress, items } = body;
  if (!customerName || !customerEmail || !customerMobile) {
    throw new HttpError(400, 'Missing customer details');
  }
  if (!shippingAddress?.line1 || !shippingAddress?.postalCode) {
    throw new HttpError(400, 'Missing shipping address');
  }
  if (!Array.isArray(items) || items.length === 0) {
    throw new HttpError(400, 'Your cart is empty');
  }

  const orderItems = [];
  for (const line of items) {
    if (!line.productId || !line.variantId || !Number.isInteger(line.quantity) || line.quantity < 1) {
      throw new HttpError(400, 'Invalid cart item');
    }

    const res = await ddb.send(new GetCommand({
      TableName: TABLES.products,
      Key: { id: line.productId },
    }));
    const product = res.Item;
    if (!product || product.active === false) {
      throw new HttpError(409, `Product no longer available`);
    }
    const variant = (product.variants ?? []).find(v => v.id === line.variantId && v.active !== false);
    if (!variant) throw new HttpError(409, `Selected option no longer available for ${product.name}`);
    if ((variant.stockQuantity ?? 0) < line.quantity) {
      throw new HttpError(409, `Insufficient stock for ${product.name}`);
    }

    const unitPrice = effectiveUnitPrice(product, variant);
    const variantDescription = Object.entries(variant.attributes ?? {})
      .map(([k, v]) => `${k}: ${v}`).join(', ');

    orderItems.push({
      productId: product.id,
      productName: product.name,
      sku: variant.sku,
      variantId: variant.id,
      variantDescription,
      unitPrice,
      quantity: line.quantity,
      lineTotal: unitPrice * line.quantity,
      productImage: product.images?.[0]?.url ?? '',
    });
  }

  const subtotal = orderItems.reduce((s, i) => s + i.lineTotal, 0);
  const discount = 0;
  const deliveryFee = deliveryFeeFor(subtotal);
  const total = subtotal - discount + deliveryFee;

  const orderReference = await nextOrderReference();
  const now = new Date().toISOString();

  const order = {
    orderReference,
    id: orderReference,
    customerName,
    customerEmail,
    customerMobile,
    shippingAddress,
    items: orderItems,
    subtotal, discount, deliveryFee, total,
    currency: 'SGD',
    status: 'PENDING_PAYMENT',
    paymentProvider: 'hitpay',
    paymentStatus: 'PENDING',
    createdAt: now,
    updatedAt: now,
  };

  await ddb.send(new PutCommand({
    TableName: TABLES.orders,
    Item: order,
    ConditionExpression: 'attribute_not_exists(orderReference)',
  }));

  const paymentUrl = `${storefrontOrigin}/checkout/success?ref=${orderReference}`;
  return created({ orderReference, paymentUrl });
}

/** Gap-free sequential reference via an atomic counter in the settings table. */
async function nextOrderReference() {
  const year = new Date().getFullYear();
  const res = await ddb.send(new UpdateCommand({
    TableName: TABLES.settings,
    Key: { key: `counter#${year}` },
    UpdateExpression: 'ADD seq :one',
    ExpressionAttributeValues: { ':one': 1 },
    ReturnValues: 'UPDATED_NEW',
  }));
  const seq = res.Attributes.seq;
  return `EZ-${year}-${String(seq).padStart(6, '0')}`;
}
