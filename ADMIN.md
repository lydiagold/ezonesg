# EZONE Admin (Phase 3)

A single **MASTER_ADMIN** manages the entire storefront from `/admin` — products,
inventory, orders, homepage content, business/delivery settings and HitPay
configuration status. No code deploy is needed to change catalogue or homepage.

The admin is **additional Angular routes in the same app** (no separate backend)
and **additional routes on the same Lambda** (`/api/admin/*`), protected by an API
Gateway **Cognito JWT authorizer** plus a backend `MASTER_ADMIN` group check.

## Architecture (unchanged, minimal cost)

```
Customer/Admin → Cloudflare DNS → AWS Amplify (Angular)
Angular       → API Gateway HTTP API → single Node 20 Lambda → DynamoDB
Images        → S3 (private, presigned upload + presigned GET)
Admin auth    → Cognito (1 user pool, 1 MASTER_ADMIN group, 1 user)
Payments      → HitPay      Secrets → Secrets Manager (1 JSON secret)
```

Phase 3 adds **≈ $0/month**: Cognito (1 user, free tier), one on-demand audit
table, a JWT authorizer (no charge), and IAM statements. The only fixed cost in
the whole stack is one Secrets Manager secret (~$0.40/mo).

## Deploy

1. **Apply infra** (creates Cognito, JWT authorizer, audit table, IAM, secret):
   ```bash
   cd infra
   cp terraform.tfvars.example terraform.tfvars   # set admin_email
   terraform init && terraform apply
   ```
   Terraform creates/invites the initial admin (Cognito emails a temp password).

2. **Configure the Angular app** from the Terraform outputs:
   ```bash
   terraform output cognito       # region, user_pool_id, web_client_id
   terraform output api_base_url
   ```
   Put these in `src/environments/environment.prod.ts` (and `environment.ts` for
   local), then set `useMock: false` and `apiBaseUrl` to the API URL.

3. **Set the HitPay secret** (sandbox until go-live):
   ```bash
   SECRET_ID="$(terraform output -json hitpay_secret | jq -r .name)"   # e.g. ezone/hitpay-dev
   aws secretsmanager put-secret-value \
     --secret-id "$SECRET_ID" \
     --secret-string '{"apiKey":"test_...","webhookSalt":"..."}'
   ```
   (Or set the API key/salt later from **Admin → Settings → Payments**.)

4. **Build & deploy** the Angular app via Amplify as usual.

## Initial admin bootstrap

- **Preferred:** set `admin_email` in `terraform.tfvars`; `terraform apply` creates
  the user, adds them to `MASTER_ADMIN`, and Cognito emails a temporary password.
- **Manually / for dev:**
  ```bash
  ADMIN_EMAIL=admin@ezone.sg ./scripts/create-dev-admin.sh
  # or supply a temp password interactively (never stored):
  ADMIN_EMAIL=admin@ezone.sg SET_PASSWORD=1 ./scripts/create-dev-admin.sh
  ```
- **First login** at `/admin/login` forces a password change (12+ chars, upper,
  lower, number, symbol). TOTP MFA is available (free) and strongly recommended
  before enabling production payments.

**No password is ever committed to source control.**

## Admin routes (Angular)

`/admin/login` · `/admin` (dashboard) · `/admin/homepage` · `/admin/products` ·
`/admin/products/new` · `/admin/products/:id` · `/admin/categories` ·
`/admin/inventory` · `/admin/orders` · `/admin/orders/:ref` · `/admin/customers` ·
`/admin/settings/{business|delivery|payments|policies}`

## Admin API (`/api/admin/*`, JWT-protected)

`GET /dashboard` · `GET /audit` · `GET /customers` ·
`GET|POST /products`, `GET|PUT|DELETE /products/{id}` ·
`GET /inventory`, `POST /inventory/adjust`, `GET /inventory/{sku}/history` ·
`GET /orders`, `GET /orders/{ref}`, `PATCH /orders/{ref}/status` ·
`GET|POST /categories`, `PUT|DELETE /categories/{slug}` ·
`GET|PUT /homepage` ·
`GET|PUT /settings/{business|delivery|payments}` ·
`POST /uploads/presign`

## Security model

- API Gateway JWT authorizer validates the Cognito token **before** the Lambda
  runs; `requireAdmin()` then enforces the `MASTER_ADMIN` group (defence in depth).
- Angular route guards are **UX only** — backend authorization is authoritative.
- **Payment status is provider/webhook controlled.** The admin can advance
  *fulfilment* (PROCESSING → … → DELIVERED / CANCELLED) but can never mark an
  unpaid order PAID.
- **HitPay secrets** live only in Secrets Manager. The API returns
  *configured / not configured* status only, never the values; nothing sensitive
  touches the browser, `localStorage`, or DynamoDB.
- **Image uploads** use presigned S3 PUTs (type/extension/size validated); the
  bucket is never publicly writable. Private objects are served via presigned GET.
- **Audit log** records product price changes, inventory adjustments, payment &
  business settings changes, order fulfilment changes, and homepage publications.
  Passwords and HitPay secrets are never logged.
