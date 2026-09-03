import { PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { ddb, TABLES } from './db.js';

/**
 * Append an audit entry. NEVER pass secret values (HitPay keys/salts, passwords)
 * in `details` — only record that a change happened, not the secret itself.
 *
 * pk groups a stream of entries; sk is time-ordered and unique within the stream.
 *   pk "audit"            → the global admin activity feed
 *   pk "inventory#<sku>"  → per-SKU stock-adjustment history
 */
export async function audit(actor, { action, entity, entityId, details }) {
  const now = new Date().toISOString();
  const sk = `${now}#${entity}#${entityId ?? ''}`;
  await ddb.send(new PutCommand({
    TableName: TABLES.audit,
    Item: {
      pk: 'audit',
      sk,
      actor: actor?.email ?? 'system',
      actorSub: actor?.sub,
      action,
      entity,
      entityId: entityId ?? null,
      details: details ?? null,
      timestamp: now,
    },
  }));
}

/** Record a stock adjustment in both the global feed and the per-SKU stream. */
export async function auditInventory(actor, { sku, productId, variantId, previousQuantity, newQuantity, reason }) {
  const now = new Date().toISOString();
  const record = {
    actor: actor?.email ?? 'system',
    actorSub: actor?.sub,
    sku,
    productId,
    variantId,
    previousQuantity,
    newQuantity,
    adjustment: newQuantity - previousQuantity,
    reason: reason ?? null,
    timestamp: now,
  };
  await ddb.send(new PutCommand({
    TableName: TABLES.audit,
    Item: { pk: `inventory#${sku}`, sk: now, ...record },
  }));
  await audit(actor, {
    action: 'INVENTORY_ADJUSTED',
    entity: 'variant',
    entityId: sku,
    details: { previousQuantity, newQuantity, adjustment: record.adjustment, reason: record.reason },
  });
}

/** Most-recent-first slice of an audit stream. */
export async function listAudit(pk = 'audit', limit = 50) {
  const res = await ddb.send(new QueryCommand({
    TableName: TABLES.audit,
    KeyConditionExpression: 'pk = :pk',
    ExpressionAttributeValues: { ':pk': pk },
    ScanIndexForward: false,
    Limit: limit,
  }));
  return res.Items ?? [];
}
