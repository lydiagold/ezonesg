# -----------------------------------------------------------------------------
# Server-side guest cart / order-draft (Increment B).
#
# Self-contained: this file only ADDS resources and does not modify the other
# lane's files. Two small integration edits are still required elsewhere (kept
# out of this file to avoid clobbering concurrent edits) — see NOTE at the end.
# -----------------------------------------------------------------------------

resource "aws_dynamodb_table" "carts" {
  name         = "${local.name}-carts-${local.suffix}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "cartToken"

  attribute {
    name = "cartToken"
    type = "S"
  }

  # Abandoned carts auto-delete — no cron, ~$0. `ttl` is epoch seconds, written
  # by the cart route and slid forward on activity.
  ttl {
    attribute_name = "ttl"
    enabled        = true
  }
}

# Scoped DynamoDB permissions for the cart route, attached to the existing API
# Lambda role (defined in iam.tf). Separate policy resource → no edit to iam.tf.
data "aws_iam_policy_document" "carts_access" {
  statement {
    sid = "CartTableAccess"
    actions = [
      "dynamodb:GetItem",
      "dynamodb:PutItem",
      "dynamodb:DeleteItem",
    ]
    resources = [aws_dynamodb_table.carts.arn]
  }
}

resource "aws_iam_role_policy" "carts_access" {
  name   = "${local.name}-carts-${local.suffix}"
  role   = aws_iam_role.api_lambda.id
  policy = data.aws_iam_policy_document.carts_access.json
}

output "carts_table" {
  description = "Server-side cart / order-draft DynamoDB table name."
  value       = aws_dynamodb_table.carts.name
}

# NOTE — two integration edits to shared files (applied at merge to avoid
# clobbering the concurrent admin-lane work):
#   1. infra/lambda.tf  → add to the Lambda `environment.variables` block:
#        CARTS_TABLE = aws_dynamodb_table.carts.name
#      (Without it, backend/src/routes/cart.js falls back to deriving the name
#       from PRODUCTS_TABLE, so it still works; explicit is preferred.)
#   2. backend/src/index.js → dispatch the cart routes (before the 404):
#        if (path === '/api/v1/carts' || path.startsWith('/api/v1/carts/'))
#          return await handleCart(event, method, path.slice('/api/v1/carts'.length));
#      with:  import { handleCart } from './routes/cart.js';
