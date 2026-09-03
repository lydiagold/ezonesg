import { listProducts, getProductBySlug } from './routes/products.js';
import { listCategories } from './routes/categories.js';
import { checkout } from './routes/checkout.js';
import { getOrder } from './routes/order.js';
import { getPublicHomepage } from './routes/homepage.js';
import { handleAdmin } from './routes/admin/index.js';
import { ok, notFound, serverError, HttpError, json } from './lib/http.js';

const STOREFRONT_ORIGIN = process.env.STOREFRONT_ORIGIN || 'https://ezone.sg';

/**
 * Single Lambda behind an API Gateway HTTP API ({proxy+} integration).
 *
 * Public routes (/api/*) are unauthenticated. Admin routes (/api/admin/*) are
 * protected by the API Gateway Cognito JWT authorizer, so any request that
 * reaches handleAdmin already carries a verified token; handleAdmin then enforces
 * the MASTER_ADMIN group. HitPay payment + webhook routes arrive in Phase 4.
 */
export async function handler(event) {
  const method = event.requestContext?.http?.method ?? 'GET';
  const path = (event.rawPath ?? '/').replace(/\/+$/, '') || '/';

  try {
    if (method === 'OPTIONS') return json(204, {}, event);

    // Authenticated admin API.
    if (path === '/api/admin' || path.startsWith('/api/admin/')) {
      const sub = path.slice('/api/admin'.length); // '' or '/products/...'
      return await handleAdmin(event, method, sub);
    }

    // Public storefront API.
    if (method === 'GET' && path === '/api/products') return await listProducts(event);
    if (method === 'GET' && path === '/api/categories') return await listCategories();
    if (method === 'GET' && path === '/api/homepage') return await getPublicHomepage();

    const productMatch = path.match(/^\/api\/products\/([^/]+)$/);
    if (method === 'GET' && productMatch) return await getProductBySlug(decodeURIComponent(productMatch[1]));

    const orderMatch = path.match(/^\/api\/orders\/([^/]+)$/);
    if (method === 'GET' && orderMatch) return await getOrder(decodeURIComponent(orderMatch[1]));

    if (method === 'POST' && path === '/api/checkout') return await checkout(event, STOREFRONT_ORIGIN);

    if (path === '/api/health') return ok({ status: 'ok' });

    return notFound('Route not found');
  } catch (err) {
    if (err instanceof HttpError) return json(err.statusCode, { error: err.message }, event);
    return serverError(err);
  }
}
