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

output "hitpay_secret_arns" {
  description = "Secrets Manager ARNs to populate with HitPay sandbox credentials."
  value = {
    api_key      = aws_secretsmanager_secret.hitpay_api_key.arn
    webhook_salt = aws_secretsmanager_secret.hitpay_webhook_salt.arn
  }
}
