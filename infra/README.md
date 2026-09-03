# EZONE Infrastructure (Terraform)

Minimal, low-cost serverless stack for the EZONE storefront. Amplify Hosting
(the existing frontend deploy) is **not** managed here and is left untouched.

```
API Gateway HTTP API  ->  Lambda (Node 20 router)  ->  DynamoDB (5 tables)
                                                    ->  S3 (product images)
                                                    ->  Secrets Manager (HitPay, Phase 4)
```

## Resources

| Resource | Purpose |
|---|---|
| DynamoDB ×5 | products, categories, orders, payments, settings (on-demand) |
| Lambda ×1 | `ezone-api-<env>` — all public routes via `{proxy+}` |
| API Gateway HTTP API | `/api/*` → Lambda, CORS locked to the storefront origin |
| S3 bucket | product images, private, presigned uploads (Phase 3) |
| Secrets Manager ×2 | HitPay API key + webhook salt (values set out-of-band) |
| IAM role + policies | least-privilege: logs + scoped DynamoDB |
| CloudWatch log groups | 14-day retention |

Not included (by design): ECS/EKS/EC2/ALB/RDS/Redis, NAT Gateway (Lambda stays
out of any VPC).

## Deploy

```bash
cd infra
cp terraform.tfvars.example terraform.tfvars   # edit as needed
terraform init
terraform plan
terraform apply                                # creates AWS resources — review first

# Load DEV seed data using the emitted table names:
cd ../backend && npm i @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb
PRODUCTS_TABLE=$(terraform -chdir=../infra output -json dynamodb_tables | jq -r .products) \
CATEGORIES_TABLE=$(terraform -chdir=../infra output -json dynamodb_tables | jq -r .categories) \
SETTINGS_TABLE=$(terraform -chdir=../infra output -json dynamodb_tables | jq -r .settings) \
AWS_REGION=ap-southeast-1 npm run seed
```

Then set the storefront `apiBaseUrl` (see `src/environments/`) to
`<api_base_url output>` and build with `useMock: false`.

## Environments

Use Terraform **workspaces** or separate `terraform.tfvars` for `dev` and `prod`
(the `environment` variable suffixes every resource name). Never point localhost
at prod tables without explicitly setting `apiBaseUrl`.

## Cost

At expected (small) traffic everything is within free-tier / cents per month.
The only fixed line items are the two Secrets Manager secrets (~US$0.40/mo each).
No always-on compute.

> ⚠️ `terraform apply` creates real, billable AWS resources. Nothing here has
> been applied automatically — run it yourself with credentials you control.
