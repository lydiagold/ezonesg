import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

/**
 * Shared DynamoDB document client. Table names come from environment variables
 * set by Terraform, so the same code runs against dev and prod tables.
 */
const client = new DynamoDBClient({});

export const ddb = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
});

export const TABLES = {
  products: process.env.PRODUCTS_TABLE,
  categories: process.env.CATEGORIES_TABLE,
  orders: process.env.ORDERS_TABLE,
  payments: process.env.PAYMENTS_TABLE,
  settings: process.env.SETTINGS_TABLE,
  audit: process.env.AUDIT_TABLE,
};
