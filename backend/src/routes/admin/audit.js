import { ok } from '../../lib/http.js';
import { listAudit } from '../../lib/audit.js';

/** GET /api/admin/audit — recent admin activity feed (most recent first). */
export async function adminListAudit(event) {
  const limit = Math.min(200, Number(event.queryStringParameters?.limit) || 50);
  return ok(await listAudit('audit', limit));
}
