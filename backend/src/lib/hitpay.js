import crypto from 'node:crypto';

/**
 * HitPay client. Sandbox vs live is chosen purely by HITPAY_API_BASE:
 *   sandbox → https://api.sandbox.hit-pay.com
 *   live    → https://api.hit-pay.com
 * The API key + webhook salt come from Secrets Manager (never hard-coded).
 * Node 20 provides global fetch, so nothing is vendored.
 */
const API_BASE = (process.env.HITPAY_API_BASE || 'https://api.sandbox.hit-pay.com').replace(/\/+$/, '');

/**
 * Create a HitPay Payment Request. Returns { id, url, status }.
 * The customer is redirected to `url` to pay (PayNow / card).
 */
export async function createPaymentRequest(apiKey, {
  amount, currency = 'SGD', email, name, referenceNumber, redirectUrl, webhookUrl, purpose,
}) {
  const form = new URLSearchParams();
  form.set('amount', Number(amount).toFixed(2));
  form.set('currency', currency);
  if (email) form.set('email', email);
  if (name) form.set('name', name);
  form.set('reference_number', referenceNumber);
  form.set('redirect_url', redirectUrl);
  form.set('webhook', webhookUrl);
  if (purpose) form.set('purpose', purpose);

  const res = await fetch(`${API_BASE}/v1/payment-requests`, {
    method: 'POST',
    headers: {
      'X-BUSINESS-API-KEY': apiKey,
      'Content-Type': 'application/x-www-form-urlencoded',
      // Makes HitPay return JSON rather than a redirect.
      'X-Requested-With': 'XMLHttpRequest',
    },
    body: form.toString(),
  });

  const text = await res.text();
  if (!res.ok) {
    // Never log the API key; log status + safe body snippet only.
    throw new Error(`HitPay create payment-request failed (${res.status}): ${text.slice(0, 300)}`);
  }
  const data = JSON.parse(text);
  return { id: data.id, url: data.url, status: data.status };
}

/**
 * Verify a HitPay webhook's HMAC signature.
 *
 * Recipe (per HitPay docs): take every POSTed field except `hmac`, sort keys
 * alphabetically, concatenate as key1value1key2value2…, HMAC-SHA256 with the
 * salt, hex-encode, and constant-time compare to the received `hmac`.
 * Returns false on any mismatch / missing salt — callers MUST refuse to mark
 * an order paid when this is false.
 */
export function verifyWebhook(params, salt) {
  const received = params?.hmac;
  if (!received || !salt) return false;

  const base = Object.keys(params)
    .filter(k => k !== 'hmac')
    .sort()
    .map(k => `${k}${params[k]}`)
    .join('');

  const expected = crypto.createHmac('sha256', salt).update(base).digest('hex');

  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(String(received), 'utf8');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
