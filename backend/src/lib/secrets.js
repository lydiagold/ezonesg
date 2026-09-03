import {
  SecretsManagerClient,
  GetSecretValueCommand,
  PutSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';

// Bundled in the Lambda Node 20 runtime — not vendored.
const sm = new SecretsManagerClient({});
const SECRET_ID = process.env.HITPAY_SECRET_ID;

/**
 * Read the HitPay secret JSON { apiKey, webhookSalt }. Returns {} if the secret
 * has never been populated. This value NEVER leaves the backend.
 */
async function readSecret() {
  try {
    const res = await sm.send(new GetSecretValueCommand({ SecretId: SECRET_ID }));
    if (!res.SecretString) return {};
    return JSON.parse(res.SecretString);
  } catch (err) {
    if (err.name === 'ResourceNotFoundException') return {};
    // An empty/never-set secret surfaces as InvalidRequestException on some paths.
    if (err.name === 'InvalidRequestException') return {};
    throw err;
  }
}

/** Safe status only — booleans, never the secret material. */
export async function hitpayStatus() {
  const s = await readSecret();
  return {
    apiKeyConfigured: Boolean(s.apiKey),
    webhookSaltConfigured: Boolean(s.webhookSalt),
  };
}

/**
 * Update one or both HitPay credentials. Merges with existing so a caller can
 * rotate just the apiKey without resubmitting the salt. Blank strings are ignored
 * (not treated as "clear"). Returns the safe status, never the values.
 */
export async function updateHitpay({ apiKey, webhookSalt }) {
  const current = await readSecret();
  const next = { ...current };
  if (typeof apiKey === 'string' && apiKey.trim()) next.apiKey = apiKey.trim();
  if (typeof webhookSalt === 'string' && webhookSalt.trim()) next.webhookSalt = webhookSalt.trim();

  await sm.send(new PutSecretValueCommand({
    SecretId: SECRET_ID,
    SecretString: JSON.stringify(next),
  }));

  return {
    apiKeyConfigured: Boolean(next.apiKey),
    webhookSaltConfigured: Boolean(next.webhookSalt),
  };
}
