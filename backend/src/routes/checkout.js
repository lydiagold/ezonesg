import { GetCommand, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { ddb, TABLES } from '../lib/db.js';
import { created, HttpError, parseBody } from '../lib/http.js';
import { getConfig, DEFAULT_DELIVERY } from '../lib/store.js';
import { getHitpayCredentials } from '../lib/secrets.js';
import { createPaymentRequest } from '../lib/hitpay.js';

// Delivery fee + free-delivery threshold are admin-configurable (settings table);
// fall back to sensible defaults if never set. Read server-side and never trusted
// from the client.
async function deliveryRules() {
  const d = (await getConfig('delivery')) ?? DEFAULT_DELIVERY;
  return {
    fee: Number(d.standardDeliveryFee ?? DEFAULT_DELIVERY.standardDeliveryFee),
    threshold: Number(d.freeDeliveryThreshold ?? DEFAULT_DELIVERY.freeDeliveryThreshold),
  };
}

function deliveryFeeFor(subtotal, rules) {
  if (subtotal <= 0) return 0;
  return subtotal >= rules.threshold ? 0 : rules.fee;
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
 * The order is created PENDING_PAYMENT, then a HitPay payment request is created
 * and the customer is redirected to HitPay to pay. Stock is decremented and the
 * order marked PAID ONLY by the verified webhook (routes/payments.js) — never
 * here and never by the browser redirect.
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
  const deliveryFee = deliveryFeeFor(subtotal, await deliveryRules());
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

  // Create the HitPay payment request and hand the customer its hosted URL.
  const { apiKey } = await getHitpayCredentials();
  if (!apiKey) {
    // Payments not configured yet — fail clearly rather than silently "succeed".
    throw new HttpError(503, 'Payments are not configured. Please try again shortly.');
  }

  const apiHost = event.requestContext?.domainName;
  const webhookUrl = `https://${apiHost}/api/payments/webhook`;
  const redirectUrl = `${storefrontOrigin}/checkout/success?ref=${encodeURIComponent(orderReference)}`;

  let payment;
  try {
    payment = await createPaymentRequest(apiKey, {
      amount: total,
      currency: 'SGD',
      email: customerEmail,
      name: customerName,
      referenceNumber: orderReference,
      redirectUrl,
      webhookUrl,
      purpose: `EZONE order ${orderReference}`,
    });
  } catch (err) {
    console.error('HitPay payment creation failed:', err.message);
    throw new HttpError(502, 'Could not start payment. Please try again.');
  }

  // Record the HitPay payment-request id for reconciliation.
  await ddb.send(new UpdateCommand({
    TableName: TABLES.orders,
    Key: { orderReference },
    UpdateExpression: 'SET paymentRequestId = :prid, updatedAt = :now',
    ExpressionAttributeValues: { ':prid': payment.id, ':now': new Date().toISOString() },
  }));

  return created({ orderReference, paymentUrl: payment.url });
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
