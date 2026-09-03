/**
 * HTTP helpers for API Gateway (HTTP API, payload format 2.0) Lambda proxy.
 * Never leak stack traces to clients — errors return a safe message only.
 */

const ALLOWED_ORIGIN = process.env.CORS_ORIGIN || '*';

const baseHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
};

export function json(statusCode, body) {
  return { statusCode, headers: baseHeaders, body: JSON.stringify(body) };
}

export const ok = body => json(200, body);
export const created = body => json(201, body);
export const badRequest = message => json(400, { error: message });
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
