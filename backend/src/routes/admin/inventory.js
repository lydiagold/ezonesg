import { GetCommand, PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { ddb, TABLES } from '../../lib/db.js';
import { ok, HttpError, parseBody } from '../../lib/http.js';
import { auditInventory, listAudit } from '../../lib/audit.js';

const DEFAULT_LOW_STOCK = 3;

/** GET /api/admin/inventory — one row per variant across all products. */
export async function adminListInventory() {
  const res = await ddb.send(new ScanCommand({ TableName: TABLES.products }));
  const rows = [];
  for (const p of res.Items ?? []) {
    for (const v of p.variants ?? []) {
      const threshold = v.lowStockThreshold ?? DEFAULT_LOW_STOCK;
      rows.push({
        productId: p.id,
        productName: p.name,
        category: p.category,
        variantId: v.id,
        sku: v.sku,
        attributes: v.attributes ?? {},
        availableQuantity: v.stockQuantity ?? 0,
        lowStockThreshold: threshold,
        lowStock: (v.stockQuantity ?? 0) <= threshold,
        active: v.active !== false,
      });
    }
  }
  rows.sort((a, b) => Number(b.lowStock) - Number(a.lowStock) || a.sku.localeCompare(b.sku));
  return ok(rows);
}

/**
 * POST /api/admin/inventory/adjust
 * Body: { productId, variantId, newQuantity | delta, reason }
 * Records previous/new/adjustment/reason/changedBy/changedAt to the audit log.
 */
export async function adminAdjustInventory(event, actor) {
  const { productId, variantId, newQuantity, delta, reason } = parseBody(event);
  if (!productId || !variantId) throw new HttpError(400, 'productId and variantId are required');

  const res = await ddb.send(new GetCommand({ TableName: TABLES.products, Key: { id: productId } }));
  const product = res.Item;
  if (!product) throw new HttpError(404, 'Product not found');

  const variants = product.variants ?? [];
  const idx = variants.findIndex(v => v.id === variantId);
  if (idx === -1) throw new HttpError(404, 'Variant not found');

  const previousQuantity = variants[idx].stockQuantity ?? 0;
  let next;
  if (newQuantity != null) {
    next = Math.trunc(Number(newQuantity));
  } else if (delta != null) {
    next = previousQuantity + Math.trunc(Number(delta));
  } else {
    throw new HttpError(400, 'Provide newQuantity or delta');
  }
  if (!Number.isFinite(next) || next < 0) throw new HttpError(400, 'Resulting quantity must be >= 0');

  variants[idx] = { ...variants[idx], stockQuantity: next };
  const updated = { ...product, variants, updatedAt: new Date().toISOString() };
  await ddb.send(new PutCommand({ TableName: TABLES.products, Item: updated }));

  await auditInventory(actor, {
    sku: variants[idx].sku,
    productId,
    variantId,
    previousQuantity,
    newQuantity: next,
    reason,
  });

  return ok({ productId, variantId, sku: variants[idx].sku, previousQuantity, newQuantity: next, adjustment: next - previousQuantity });
}

/** GET /api/admin/inventory/{sku}/history */
export async function adminInventoryHistory(sku) {
  const items = await listAudit(`inventory#${sku}`, 100);
  return ok(items);
}
