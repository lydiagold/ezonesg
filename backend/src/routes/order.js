import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { ddb, TABLES } from '../lib/db.js';
import { ok, notFound } from '../lib/http.js';

/**
 * GET /api/orders/{orderReference}
 *
 * The order reference acts as an unguessable access token for guests. Only
 * status-relevant fields are returned — no internal payment identifiers.
 */
export async function getOrder(orderReference) {
  const res = await ddb.send(new GetCommand({
    TableName: TABLES.orders,
    Key: { orderReference },
  }));
  const o = res.Item;
  if (!o) return notFound('Order not found');

  return ok({
    orderReference: o.orderReference,
    id: o.orderReference,
    customerName: o.customerName,
    customerEmail: o.customerEmail,
    customerMobile: o.customerMobile,
    shippingAddress: o.shippingAddress,
    items: o.items,
    subtotal: o.subtotal,
    discount: o.discount,
    deliveryFee: o.deliveryFee,
    total: o.total,
    currency: o.currency,
    status: o.status,
    paymentProvider: o.paymentProvider,
    paymentStatus: o.paymentStatus,
    createdAt: o.createdAt,
    paidAt: o.paidAt,
    updatedAt: o.updatedAt,
  });
}
