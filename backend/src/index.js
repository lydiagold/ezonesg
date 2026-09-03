import { listProducts, getProductBySlug } from './routes/products.js';
import { listCategories } from './routes/categories.js';
import { checkout } from './routes/checkout.js';
import { getOrder } from './routes/order.js';
import { ok, notFound, serverError, HttpError, json } from './lib/http.js';

const STOREFRONT_ORIGIN = process.env.STOREFRONT_ORIGIN || 'https://ezone.sg';

/**
 * Single Lambda behind an API Gateway HTTP API ({proxy+} integration).
 * Public routes only — admin endpoints are added in Phase 3 with a Cognito
 * JWT authorizer, and HitPay payment + webhook routes in Phase 4.
 */
export async function handler(event) {
  const method = event.requestContext?.http?.method ?? 'GET';
  // Strip an optional stage prefix; normalise trailing slash.
  const path = (event.rawPath ?? '/').replace(/\/+$/, '') || '/';

  try {
    if (method === 'OPTIONS') return json(204, {});

    if (method === 'GET' && path === '/api/products') return await listProducts(event);
    if (method === 'GET' && path === '/api/categories') return await listCategories();

    const productMatch = path.match(/^\/api\/products\/([^/]+)$/);
    if (method === 'GET' && productMatch) return await getProductBySlug(decodeURIComponent(productMatch[1]));

    const orderMatch = path.match(/^\/api\/orders\/([^/]+)$/);
    if (method === 'GET' && orderMatch) return await getOrder(decodeURIComponent(orderMatch[1]));

    if (method === 'POST' && path === '/api/checkout') return await checkout(event, STOREFRONT_ORIGIN);

    if (path === '/api/health') return ok({ status: 'ok' });

    return notFound('Route not found');
  } catch (err) {
    if (err instanceof HttpError) return json(err.statusCode, { error: err.message });
    return serverError(err);
  }
}
