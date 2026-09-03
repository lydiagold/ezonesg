import { HttpError } from './http.js';

const REQUIRED_GROUP = process.env.COGNITO_GROUP || 'MASTER_ADMIN';

/**
 * Authorization for /api/admin/* requests.
 *
 * The API Gateway JWT authorizer has ALREADY cryptographically verified the
 * Cognito access token (signature, issuer, audience, expiry) before the Lambda
 * runs — an unauthenticated request never reaches here. This function performs
 * the second, defence-in-depth check: that the caller is actually in the
 * MASTER_ADMIN group. Never trust route guards alone; this is authoritative.
 *
 * Returns a small actor descriptor used for audit logging.
 */
export function requireAdmin(event) {
  const claims = event.requestContext?.authorizer?.jwt?.claims;
  if (!claims) {
    // Missing authorizer context ⇒ the route was reached without the JWT
    // authorizer (misconfiguration). Fail closed.
    throw new HttpError(401, 'Not authenticated');
  }

  // Cognito puts groups in "cognito:groups". API Gateway may deliver it as a JSON
  // array, a JSON-encoded string, or a bracketed space-separated string.
  const groups = parseGroups(claims['cognito:groups']);
  if (!groups.includes(REQUIRED_GROUP)) {
    throw new HttpError(403, 'Administrator access required');
  }

  return {
    sub: claims.sub,
    email: claims.email || claims.username || claims['cognito:username'] || claims.sub,
    groups,
  };
}

function parseGroups(raw) {
  if (raw == null) return [];
  if (Array.isArray(raw)) return raw;
  const s = String(raw).trim();
  if (s.startsWith('[')) {
    try {
      const parsed = JSON.parse(s);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // Fall through to bracket/space parsing (e.g. "[MASTER_ADMIN other]").
    }
  }
  return s.replace(/^\[|\]$/g, '').split(/[\s,]+/).filter(Boolean);
}
