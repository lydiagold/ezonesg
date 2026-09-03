/**
 * HTTP helpers for API Gateway (HTTP API, payload format 2.0) Lambda proxy.
 * Never leak stack traces to clients — errors return a safe message only.
 */

// CORS_ORIGIN may be a single origin or a comma-separated allow-list. API Gateway
// also sets CORS headers, but the Lambda echoes a valid origin so direct/local
// invocations behave too. '*' when unset (dev).
const ALLOWED_ORIGINS = (process.env.CORS_ORIGIN || '*')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

function corsOrigin(event) {
  if (ALLOWED_ORIGINS.includes('*')) return '*';
  const reqOrigin = event?.headers?.origin || event?.headers?.Origin;
  if (reqOrigin && ALLOWED_ORIGINS.includes(reqOrigin)) return reqOrigin;
  return ALLOWED_ORIGINS[0];
}

function baseHeaders(event) {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': corsOrigin(event),
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    Vary: 'Origin',
  };
}

/**
 * Build a JSON response. Pass the Lambda `event` as the third arg so the correct
 * CORS origin is echoed; omit it for responses where the origin is irrelevant.
 */
export function json(statusCode, body, event) {
  return { statusCode, headers: baseHeaders(event), body: JSON.stringify(body) };
}

export const ok = body => json(200, body);
export const created = body => json(201, body);
export const noContent = () => json(204, {});
export const badRequest = message => json(400, { error: message });
export const unauthorized = (message = 'Unauthorized') => json(401, { error: message });
export const forbidden = (message = 'Forbidden') => json(403, { error: message });
export const notFound = (message = 'Not found') => json(404, { error: message });
export const conflict = message => json(409, { error: message });

/** Log the real error server-side; return a generic 500 to the client. */
export function serverError(err) {
  console.error('Unhandled error:', err);
  return json(500, { error: 'Something went wrong. Please try again.' });
}

export function parseBody(event) {
  if (!event.body) return {};
  const raw = event.isBase64Encoded
    ? Buffer.from(event.body, 'base64').toString('utf8')
    : event.body;
  try {
    return JSON.parse(raw);
  } catch {
    throw new HttpError(400, 'Invalid JSON body');
  }
}

export class HttpError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}
