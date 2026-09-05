import { GetCommand, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { ddb, TABLES } from '../lib/db.js';
import { getHitpayCredentials } from '../lib/secrets.js';
import { verifyWebhook } from '../lib/hitpay.js';
import { json } from '../lib/http.js';

/**
 * POST /api/payments/webhook — HitPay server-to-server callback.
 *
 * This is the SOLE authority for the PAID transition. Security + correctness:
 *   1. Verify the HMAC signature with the webhook salt (reject if invalid).
 *   2. Idempotency latch: conditionally insert the payment by providerPaymentId;
 *      a retry (HitPay retries) finds it already present and no-ops.
 *   3. Amount guard: the paid amount must match the order's authoritative total.
 *   4. Mark PAID with a condition so it only transitions once.
 *   5. Atomically decrement variant stock (condition prevents overselling).
 * Always returns 200 to HitPay on handled events (so it stops retrying); only an
 * invalid signature returns 400.
 */
export async function handleWebhook(event) {
  const raw = event.isBase64Encoded
    ? Buffer.from(event.body || '', 'base64').toString('utf8')
    : (event.body || '');
  const params = Object.fromEntries(new URLSearchParams(raw));

  const { webhookSalt } = await getHitpayCredentials();
  if (!verifyWebhook(params, webhookSalt)) {
    console.warn('HitPay webhook: signature verification FAILED — ignoring');
    return json(400, { error: 'invalid signature' });
  }

  const paymentId = params.payment_id;
  const orderReference = params.reference_number;
  const status = params.status;
  const amount = Number(params.amount);

  if (!paymentId || !orderReference) return json(200, { ok: true, note: 'missing ids' });

  // (2) Idempotency latch — first webhook for this payment wins.
  try {
    await ddb.send(new PutCommand({
      TableName: TABLES.payments,
      Item: {
        providerPaymentId: paymentId,
        paymentRequestId: params.payment_request_id ?? null,
        orderReference,
        amount,
        currency: params.currency ?? 'SGD',
        status,
        provider: 'hitpay',
        receivedAt: new Date().toISOString(),
      },
      ConditionExpression: 'attribute_not_exists(providerPaymentId)',
    }));
  } catch (err) {
    if (err.name === 'ConditionalCheckFailedException') {
      return json(200, { ok: true, note: 'already processed' });
    }
    throw err;
  }

  if (status !== 'completed') {
    await updateOrderPaymentStatus(orderReference, mapStatus(status));
    return json(200, { ok: true, note: `recorded ${status}` });
  }

  const ordRes = await ddb.send(new GetCommand({ TableName: TABLES.orders, Key: { orderReference } }));
  const order = ordRes.Item;
  if (!order) {
    console.error('HitPay webhook: order not found for', orderReference);
    return json(200, { ok: true, note: 'no order' });
  }

  // (3) Amount guard — never mark paid if the amount does not match our total.
  if (!Number.isFinite(amount) || Math.abs(amount - Number(order.total)) > 0.01) {
    console.error(`HitPay webhook: amount mismatch for ${orderReference} (got ${amount}, expected ${order.total})`);
    await updateOrderPaymentStatus(orderReference, 'MISMATCH');
    return json(200, { ok: true, note: 'amount mismatch' });
  }

  // (4) Mark PAID exactly once.
  const now = new Date().toISOString();
  try {
    await ddb.send(new UpdateCommand({
      TableName: TABLES.orders,
      Key: { orderReference },
      UpdateExpression: 'SET #s = :paid, paymentStatus = :done, providerPaymentId = :pid, paidAt = :now, updatedAt = :now',
      ConditionExpression: 'paymentStatus <> :done',
      ExpressionAttributeNames: { '#s': 'status' },
      ExpressionAttributeValues: { ':paid': 'PAID', ':done': 'COMPLETED', ':pid': paymentId, ':now': now },
    }));
  } catch (err) {
    if (err.name === 'ConditionalCheckFailedException') {
      return json(200, { ok: true, note: 'already paid' });
    }
    throw err;
  }

  // (5) Atomic stock decrement per line item.
  await decrementStock(order.items ?? []);

  return json(200, { ok: true, note: 'paid' });
}

function mapStatus(hitpayStatus) {
  switch (hitpayStatus) {
    case 'completed': return 'COMPLETED';
    case 'failed': return 'FAILED';
    case 'expired': return 'EXPIRED';
    case 'pending': return 'PENDING';
    default: return 'PENDING';
  }
}

async function updateOrderPaymentStatus(orderReference, paymentStatus) {
  try {
    await ddb.send(new UpdateCommand({
      TableName: TABLES.orders,
      Key: { orderReference },
      UpdateExpression: 'SET paymentStatus = :ps, updatedAt = :now',
      ConditionExpression: 'attribute_exists(orderReference)',
      ExpressionAttributeValues: { ':ps': paymentStatus, ':now': new Date().toISOString() },
    }));
  } catch (err) {
    if (err.name !== 'ConditionalCheckFailedException') throw err;
  }
}

/**
 * Decrement variant stock. Stock lives on a variant inside the product's
 * `variants` list; we locate the index then decrement with a guard so stock can
 * never go negative. Best-effort per item — a miss is logged, not fatal (the
 * payment is already captured; admin can reconcile).
 */
async function decrementStock(items) {
  for (const it of items) {
    try {
      const res = await ddb.send(new GetCommand({ TableName: TABLES.products, Key: { id: it.productId } }));
      const product = res.Item;
      if (!product) { console.error('stock: product missing', it.productId); continue; }
      const idx = (product.variants ?? []).findIndex(v => v.id === it.variantId || v.sku === it.sku);
      if (idx < 0) { console.error('stock: variant missing', it.sku); continue; }

      await ddb.send(new UpdateCommand({
        TableName: TABLES.products,
        Key: { id: it.productId },
        UpdateExpression: `SET variants[${idx}].stockQuantity = variants[${idx}].stockQuantity - :q, updatedAt = :now`,
        ConditionExpression: `variants[${idx}].stockQuantity >= :q`,
        ExpressionAttributeValues: { ':q': it.quantity, ':now': new Date().toISOString() },
      }));
    } catch (err) {
      console.error('stock decrement failed for', it.sku, err.name || err.message);
    }
  }
}
