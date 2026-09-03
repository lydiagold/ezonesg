import { ScanCommand } from '@aws-sdk/lib-dynamodb';
import { ddb, TABLES } from '../../lib/db.js';
import { ok } from '../../lib/http.js';

const DEFAULT_LOW_STOCK = 3;

/** GET /api/admin/dashboard — compact counts + recent orders for /admin. */
export async function adminDashboard() {
  const [productsRes, ordersRes] = await Promise.all([
    ddb.send(new ScanCommand({ TableName: TABLES.products })),
    ddb.send(new ScanCommand({ TableName: TABLES.orders })),
  ]);
  const products = productsRes.Items ?? [];
  const orders = ordersRes.Items ?? [];

  const activeProducts = products.filter(p => p.active !== false && !p.archived);
  let lowStock = 0;
  for (const p of products) {
    for (const v of p.variants ?? []) {
      const threshold = v.lowStockThreshold ?? DEFAULT_LOW_STOCK;
      if (v.active !== false && (v.stockQuantity ?? 0) <= threshold) lowStock += 1;
    }
  }

  const today = new Date().toISOString().slice(0, 10);
  const ordersToday = orders.filter(o => (o.createdAt ?? '').slice(0, 10) === today).length;
  const pendingPayment = orders.filter(o => o.paymentStatus === 'PENDING').length;
  const paidOrders = orders.filter(o => o.paymentStatus === 'COMPLETED');
  const revenue = paidOrders.reduce((s, o) => s + (o.total ?? 0), 0);

  const recentOrders = [...orders]
    .sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))
    .slice(0, 8)
    .map(o => ({
      orderReference: o.orderReference,
      customerName: o.customerName,
      total: o.total,
      currency: o.currency,
      status: o.status,
      paymentStatus: o.paymentStatus,
      createdAt: o.createdAt,
    }));

  return ok({
    products: activeProducts.length,
    lowStock,
    ordersToday,
    pendingPayment,
    paidOrders: paidOrders.length,
    revenue,
    currency: 'SGD',
    recentOrders,
  });
}
