import { PutCommand, ScanCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { ddb, TABLES } from '../../lib/db.js';
import { ok, created, noContent, HttpError, parseBody } from '../../lib/http.js';
import { audit } from '../../lib/audit.js';

/** GET /api/admin/categories */
export async function adminListCategories() {
  const res = await ddb.send(new ScanCommand({ TableName: TABLES.categories }));
  const items = (res.Items ?? []).sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
  return ok(items);
}

/** POST /api/admin/categories  (also used for upsert by slug) */
export async function adminUpsertCategory(event, actor, slug) {
  const body = parseBody(event);
  const key = (slug || body.slug || '').trim();
  if (!key) throw new HttpError(400, 'slug is required');
  const item = {
    slug: key,
    name: String(body.name || '').trim() || key,
    tagline: String(body.tagline || '').trim(),
    route: String(body.route || `/shop/${key}`).trim(),
    imageKey: String(body.imageKey || '').trim(),
    sort: Number(body.sort) || 0,
    active: body.active !== false,
  };
  await ddb.send(new PutCommand({ TableName: TABLES.categories, Item: item }));
  await audit(actor, { action: 'CATEGORY_SAVED', entity: 'category', entityId: key, details: { name: item.name } });
  return slug ? ok(item) : created(item);
}

/** DELETE /api/admin/categories/{slug} */
export async function adminDeleteCategory(actor, slug) {
  await ddb.send(new DeleteCommand({ TableName: TABLES.categories, Key: { slug } }));
  await audit(actor, { action: 'CATEGORY_DELETED', entity: 'category', entityId: slug });
  return noContent();
}
