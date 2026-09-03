output "api_base_url" {
  description = "Base URL for the storefront's apiBaseUrl (append /api)."
  value       = aws_apigatewayv2_api.http.api_endpoint
}

output "product_images_bucket" {
  description = "S3 bucket for product images."
  value       = aws_s3_bucket.images.bucket
}

output "dynamodb_tables" {
  description = "Created DynamoDB table names (use with the seed script)."
  value = {
    products   = aws_dynamodb_table.products.name
    categories = aws_dynamodb_table.categories.name
    orders     = aws_dynamodb_table.orders.name
    payments   = aws_dynamodb_table.payments.name
    settings   = aws_dynamodb_table.settings.name
  }
}

output "hitpay_secret" {
  description = "Secrets Manager secret (JSON: apiKey + webhookSalt) to populate with HitPay sandbox credentials."
  value = {
    name = aws_secretsmanager_secret.hitpay.name
    arn  = aws_secretsmanager_secret.hitpay.arn
  }
}

# -----------------------------------------------------------------------------
# Cognito — copy these into src/environments/environment(.prod).ts (cognito block)
# so the Angular admin SPA can authenticate. None of these are secrets.
# -----------------------------------------------------------------------------
output "cognito" {
  description = "Cognito config for the Angular admin app (public values)."
  value = {
    region        = var.aws_region
    user_pool_id  = aws_cognito_user_pool.admin.id
    web_client_id = aws_cognito_user_pool_client.admin_web.id
    group         = aws_cognito_user_group.master_admin.name
  }
}

output "audit_table" {
  description = "Audit log DynamoDB table name."
  value       = aws_dynamodb_table.audit.name
}
