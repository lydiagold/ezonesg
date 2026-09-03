import { requireAdmin } from '../../lib/auth.js';
import { notFound } from '../../lib/http.js';
import {
  adminListProducts, adminGetProduct, adminCreateProduct, adminUpdateProduct, adminArchiveProduct,
} from './products.js';
import { adminListInventory, adminAdjustInventory, adminInventoryHistory } from './inventory.js';
import {
  adminListOrders, adminGetOrder, adminUpdateOrderStatus, adminListCustomers,
} from './orders.js';
import { adminListCategories, adminUpsertCategory, adminDeleteCategory } from './categories.js';
import { adminGetHomepage, adminSaveHomepage } from './homepage.js';
import {
  adminGetBusiness, adminSaveBusiness, adminGetDelivery, adminSaveDelivery,
  adminGetPayments, adminSavePayments,
} from './settings.js';
import { adminPresignUpload } from './uploads.js';
import { adminDashboard } from './dashboard.js';
import { adminListAudit } from './audit.js';

/**
 * Dispatch for authenticated admin requests. `sub` is the path AFTER /api/admin
 * (e.g. "/products/abc"). The API Gateway JWT authorizer has already validated
 * the token; requireAdmin additionally enforces the MASTER_ADMIN group.
 */
export async function handleAdmin(event, method, sub) {
  const actor = requireAdmin(event); // throws 401/403 if not an admin

  // ----- dashboard -----
  if (method === 'GET' && sub === '/dashboard') return adminDashboard();
  if (method === 'GET' && sub === '/audit') return adminListAudit(event);
  if (method === 'GET' && sub === '/customers') return adminListCustomers();

  // ----- products -----
  if (method === 'GET' && sub === '/products') return adminListProducts();
  if (method === 'POST' && sub === '/products') return adminCreateProduct(event, actor);
  let m = sub.match(/^\/products\/([^/]+)$/);
  if (m) {
    const id = decodeURIComponent(m[1]);
    if (method === 'GET') return adminGetProduct(id);
    if (method === 'PUT') return adminUpdateProduct(event, actor, id);
    if (method === 'DELETE') return adminArchiveProduct(event, actor, id);
  }

  // ----- inventory -----
  if (method === 'GET' && sub === '/inventory') return adminListInventory();
  if (method === 'POST' && sub === '/inventory/adjust') return adminAdjustInventory(event, actor);
  m = sub.match(/^\/inventory\/([^/]+)\/history$/);
  if (m && method === 'GET') return adminInventoryHistory(decodeURIComponent(m[1]));

  // ----- orders -----
  if (method === 'GET' && sub === '/orders') return adminListOrders(event);
  m = sub.match(/^\/orders\/([^/]+)$/);
  if (m && method === 'GET') return adminGetOrder(decodeURIComponent(m[1]));
  m = sub.match(/^\/orders\/([^/]+)\/status$/);
  if (m && (method === 'PATCH' || method === 'PUT')) return adminUpdateOrderStatus(event, actor, decodeURIComponent(m[1]));

  // ----- categories -----
  if (method === 'GET' && sub === '/categories') return adminListCategories();
  if (method === 'POST' && sub === '/categories') return adminUpsertCategory(event, actor, null);
  m = sub.match(/^\/categories\/([^/]+)$/);
  if (m) {
    const slug = decodeURIComponent(m[1]);
    if (method === 'PUT') return adminUpsertCategory(event, actor, slug);
    if (method === 'DELETE') return adminDeleteCategory(actor, slug);
  }

  // ----- homepage -----
  if (sub === '/homepage') {
    if (method === 'GET') return adminGetHomepage();
    if (method === 'PUT' || method === 'POST') return adminSaveHomepage(event, actor);
  }

  // ----- settings -----
  if (sub === '/settings/business') {
    if (method === 'GET') return adminGetBusiness();
    if (method === 'PUT' || method === 'POST') return adminSaveBusiness(event, actor);
  }
  if (sub === '/settings/delivery') {
    if (method === 'GET') return adminGetDelivery();
    if (method === 'PUT' || method === 'POST') return adminSaveDelivery(event, actor);
  }
  if (sub === '/settings/payments') {
    if (method === 'GET') return adminGetPayments();
    if (method === 'PUT' || method === 'POST') return adminSavePayments(event, actor);
  }

  // ----- uploads -----
  if (method === 'POST' && sub === '/uploads/presign') return adminPresignUpload(event, actor);

  // A whoami convenience for the SPA to confirm the session is a valid admin.
  if (method === 'GET' && (sub === '/me' || sub === '')) {
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: actor.email, groups: actor.groups }) };
  }

  return notFound('Admin route not found');
}
