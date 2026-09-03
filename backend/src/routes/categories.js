import { ScanCommand } from '@aws-sdk/lib-dynamodb';
import { ddb, TABLES } from '../lib/db.js';
import { ok } from '../lib/http.js';

/** GET /api/categories — list configurable storefront categories. */
export async function listCategories() {
  const res = await ddb.send(new ScanCommand({ TableName: TABLES.categories }));
  const items = (res.Items ?? []).sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
  return ok(items);
}
