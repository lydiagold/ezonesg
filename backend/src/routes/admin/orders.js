import { GetCommand, PutCommand, ScanCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { ddb, TABLES } from '../../lib/db.js';
import { ok, HttpError, parseBody } from '../../lib/http.js';
import { audit } from '../../lib/audit.js';

// Fulfilment states an admin may set. Payment states (PENDING_PAYMENT → PAID,
// REFUNDED) are provider/webhook controlled and NOT settable here.
const FULFILMENT_STATES = ['PROCESSING', 'READY', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

/** GET /api/admin/orders?status=PAID — newest first. */
export async function adminListOrders(event) {
  const status = event.queryStringParameters?.status;
  let items;
  if (status) {
    const res = await ddb.send(new QueryCommand({
      TableName: TABLES.orders,
      IndexName: 'status-index',
      KeyConditionExpression: '#s = :s',
      ExpressionAttributeNames: { '#s': 'status' },
      ExpressionAttributeValues: { ':s': status },
      ScanIndexForward: false,
    }));
    items = res.Items ?? [];
  } else {
    const res = await ddb.send(new ScanCommand({ TableName: TABLES.orders }));
    items = (res.Items ?? []).sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));
  }
  return ok(items);
}

/** GET /api/admin/orders/{ref} — full order (admins see everything). */
export async function adminGetOrder(orderReference) {
  const res = await ddb.send(new GetCommand({ TableName: TABLES.orders, Key: { orderReference } }));
  if (!res.Item) throw new HttpError(404, 'Order not found');
  return ok(res.Item);
}

/**
 * PATCH /api/admin/orders/{ref}/status  Body: { status, note? }
 * Advances FULFILMENT only. Refuses to touch payment status.
 */
export async function adminUpdateOrderStatus(event, actor, orderReference) {
  const { status, note } = parseBody(event);
  if (!FULFILMENT_STATES.includes(status)) {
    throw new HttpError(400, `status must be one of ${FULFILMENT_STATES.join(', ')}`);
  }

  const res = await ddb.send(new GetCommand({ TableName: TABLES.orders, Key: { orderReference } }));
  const order = res.Item;
  if (!order) throw new HttpError(404, 'Order not found');

  // Cannot fulfil an order that has not been paid — payment is authoritative.
  if (order.paymentStatus !== 'COMPLETED' && status !== 'CANCELLED') {
    throw new HttpError(409, 'Order is not paid yet; only cancellation is allowed');
  }

  const now = new Date().toISOString();
  const updated = {
    ...order,
    status,
    fulfilmentNote: note ?? order.fulfilmentNote,
    updatedAt: now,
  };
  await ddb.send(new PutCommand({ TableName: TABLES.orders, Item: updated }));

  await audit(actor, {
    action: 'ORDER_STATUS_CHANGED',
    entity: 'order',
    entityId: orderReference,
    details: { from: order.status, to: status, note: note ?? null },
  });
  return ok(updated);
}

/** GET /api/admin/customers — derived from orders (no separate customer store). */
export async function adminListCustomers() {
  const res = await ddb.send(new ScanCommand({ TableName: TABLES.orders }));
  const byEmail = new Map();
  for (const o of res.Items ?? []) {
    const key = (o.customerEmail || '').toLowerCase();
    if (!key) continue;
    const c = byEmail.get(key) ?? {
      email: o.customerEmail,
      name: o.customerName,
      mobile: o.customerMobile,
      orders: 0,
      totalSpent: 0,
      lastOrderAt: '',
    };
    c.orders += 1;
    if (o.paymentStatus === 'COMPLETED') c.totalSpent += o.total ?? 0;
    if ((o.createdAt ?? '') > c.lastOrderAt) {
      c.lastOrderAt = o.createdAt ?? '';
      c.name = o.customerName;
      c.mobile = o.customerMobile;
    }
    byEmail.set(key, c);
  }
  const customers = [...byEmail.values()].sort((a, b) => b.lastOrderAt.localeCompare(a.lastOrderAt));
  return ok(customers);
}
