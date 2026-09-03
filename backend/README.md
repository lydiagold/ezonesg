# EZONE API (Phase 2)

A single Node 20 Lambda behind an API Gateway **HTTP API**, using a `{proxy+}`
integration and an internal router ([src/index.js](src/index.js)). Deliberately
small and low-maintenance.

## Routes (public)

| Method | Path | Handler | Notes |
|---|---|---|---|
| GET | `/api/products` | `routes/products.js` | `?category=` and `?q=` filters |
| GET | `/api/products/{slug}` | `routes/products.js` | via `slug-index` GSI |
| GET | `/api/categories` | `routes/categories.js` | |
| POST | `/api/checkout` | `routes/checkout.js` | server recomputes total; creates `PENDING_PAYMENT` |
| GET | `/api/orders/{orderReference}` | `routes/order.js` | reference acts as guest access token |
| GET | `/api/health` | — | health check |

Admin routes (Cognito-guarded) arrive in Phase 3; HitPay payment creation +
webhook in Phase 4.

## DynamoDB model (one table per entity — maintainable over clever)

- **products** — PK `id`; GSI `slug-index` (`slug`), GSI `category-index` (`category`). Variants embedded; stock on each variant.
- **categories** — PK `slug`.
- **orders** — PK `orderReference`; GSI `status-index` (`status` + `createdAt`) for admin filtering. Immutable price snapshot per item.
- **payments** — PK `providerPaymentId`; GSI `order-index` (`orderReference`). Used for Phase 4 webhook idempotency.
- **settings** — PK `key`; holds business settings and the `counter#<year>` order-reference counter.

## Security notes

- The client sends only product/variant/quantity; the server computes the
  authoritative total from the catalogue and validates stock. The browser amount
  is never trusted.
- Errors never leak stack traces (`lib/http.js`).
- The AWS SDK v3 is provided by the Lambda runtime and is intentionally not
  vendored.

## Local

```bash
npm run check     # syntax-check the router
npm run seed      # load DEV seed data (requires table-name env vars + AWS creds)
```
