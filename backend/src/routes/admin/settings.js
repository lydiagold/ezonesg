import { ok, HttpError, parseBody } from '../../lib/http.js';
import { getConfig, putConfig, DEFAULT_BUSINESS, DEFAULT_DELIVERY } from '../../lib/store.js';
import { hitpayStatus, updateHitpay } from '../../lib/secrets.js';
import { audit } from '../../lib/audit.js';

const HITPAY_ENV = process.env.HITPAY_ENVIRONMENT || 'sandbox';
const STOREFRONT = process.env.STOREFRONT_ORIGIN || 'https://ezone.sg';
const API_BASE = process.env.PUBLIC_API_BASE || '';

/** GET /api/admin/settings/business */
export async function adminGetBusiness() {
  return ok((await getConfig('business')) ?? DEFAULT_BUSINESS);
}

/** PUT /api/admin/settings/business */
export async function adminSaveBusiness(event, actor) {
  const body = parseBody(event);
  const current = (await getConfig('business')) ?? DEFAULT_BUSINESS;
  const merged = { ...current, ...sanitizeBusiness(body) };
  const saved = await putConfig('business', merged);
  await audit(actor, { action: 'BUSINESS_SETTINGS_CHANGED', entity: 'settings', entityId: 'business' });
  return ok(saved);
}

/** GET /api/admin/settings/delivery */
export async function adminGetDelivery() {
  return ok((await getConfig('delivery')) ?? DEFAULT_DELIVERY);
}

/** PUT /api/admin/settings/delivery */
export async function adminSaveDelivery(event, actor) {
  const body = parseBody(event);
  const current = (await getConfig('delivery')) ?? DEFAULT_DELIVERY;
  const merged = {
    ...current,
    standardDeliveryFee: nonNeg(body.standardDeliveryFee, current.standardDeliveryFee),
    freeDeliveryThreshold: nonNeg(body.freeDeliveryThreshold, current.freeDeliveryThreshold),
    pickupEnabled: body.pickupEnabled != null ? Boolean(body.pickupEnabled) : current.pickupEnabled,
    deliveryEnabled: body.deliveryEnabled != null ? Boolean(body.deliveryEnabled) : current.deliveryEnabled,
    pickupAddress: str(body.pickupAddress, current.pickupAddress),
    pickupInstructions: str(body.pickupInstructions, current.pickupInstructions),
  };
  const saved = await putConfig('delivery', merged);
  await audit(actor, { action: 'DELIVERY_SETTINGS_CHANGED', entity: 'settings', entityId: 'delivery' });
  return ok(saved);
}

/**
 * GET /api/admin/settings/payments — status ONLY. Never returns secret values.
 */
export async function adminGetPayments() {
  const status = await hitpayStatus();
  return ok({
    provider: 'HitPay',
    environment: HITPAY_ENV,
    apiKey: status.apiKeyConfigured ? 'Configured' : 'Not configured',
    webhookSalt: status.webhookSaltConfigured ? 'Configured' : 'Not configured',
    webhookUrl: API_BASE ? `${API_BASE}/api/payments/webhook` : '(set after deploy) /api/payments/webhook',
    returnUrl: `${STOREFRONT}/checkout/success`,
  });
}

/**
 * PUT /api/admin/settings/payments — update HitPay credentials.
 * Angular → admin API → Secrets Manager. The values never touch DynamoDB or the
 * browser's storage, and are never echoed back.
 */
export async function adminSavePayments(event, actor) {
  const { apiKey, webhookSalt } = parseBody(event);
  if (!apiKey && !webhookSalt) throw new HttpError(400, 'Provide apiKey and/or webhookSalt');
  const status = await updateHitpay({ apiKey, webhookSalt });
  // Audit that a change happened — NEVER the values themselves.
  await audit(actor, {
    action: 'PAYMENT_SETTINGS_CHANGED',
    entity: 'settings',
    entityId: 'payments',
    details: { apiKeyUpdated: Boolean(apiKey), webhookSaltUpdated: Boolean(webhookSalt) },
  });
  return ok({
    apiKey: status.apiKeyConfigured ? 'Configured' : 'Not configured',
    webhookSalt: status.webhookSaltConfigured ? 'Configured' : 'Not configured',
  });
}

function sanitizeBusiness(b) {
  const out = {};
  for (const k of [
    'displayName', 'legalName', 'supportEmail', 'supportMobile', 'whatsappNumber',
    'businessHours', 'storeAddress', 'pickupAddress', 'pickupInstructions', 'gstNumber',
    'returnPolicy', 'warrantyPolicy', 'deliveryPolicy', 'privacyNote',
  ]) {
    if (b[k] != null) out[k] = String(b[k]).trim();
  }
  if (b.gstRegistered != null) out.gstRegistered = Boolean(b.gstRegistered);
  return out;
}

const str = (v, fallback) => (v != null ? String(v).trim() : fallback);
const nonNeg = (v, fallback) => {
  if (v == null || v === '') return fallback;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
};
