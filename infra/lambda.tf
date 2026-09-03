# -----------------------------------------------------------------------------
# API Lambda — single Node 20 function; the source is the backend/src directory.
# AWS SDK v3 is provided by the runtime, so the zip is just source (no bundling).
# -----------------------------------------------------------------------------

data "archive_file" "api" {
  type        = "zip"
  source_dir  = "${path.module}/../backend/src"
  output_path = "${path.module}/.build/api.zip"
}

resource "aws_cloudwatch_log_group" "api" {
  name              = "/aws/lambda/${local.name}-api-${local.suffix}"
  retention_in_days = var.log_retention_days
}

resource "aws_lambda_function" "api" {
  function_name = "${local.name}-api-${local.suffix}"
  role          = aws_iam_role.api_lambda.arn
  runtime       = "nodejs20.x"
  handler       = "index.handler"
  timeout       = 10
  memory_size   = 256

  filename         = data.archive_file.api.output_path
  source_code_hash = data.archive_file.api.output_base64sha256

  environment {
    variables = {
      PRODUCTS_TABLE    = aws_dynamodb_table.products.name
      CATEGORIES_TABLE  = aws_dynamodb_table.categories.name
      ORDERS_TABLE      = aws_dynamodb_table.orders.name
      PAYMENTS_TABLE    = aws_dynamodb_table.payments.name
      SETTINGS_TABLE    = aws_dynamodb_table.settings.name
      AUDIT_TABLE       = aws_dynamodb_table.audit.name
      IMAGES_BUCKET     = aws_s3_bucket.images.bucket
      HITPAY_SECRET_ID  = aws_secretsmanager_secret.hitpay.name
      MAX_UPLOAD_BYTES  = tostring(var.max_upload_bytes)
      COGNITO_GROUP     = aws_cognito_user_group.master_admin.name
      STOREFRONT_ORIGIN = var.storefront_origin
      # Allow the storefront + any extra origins (Amplify preview, localhost) so
      # the admin SPA can call the API with credentials during development too.
      CORS_ORIGIN = join(",", local.cors_origins)
    }
  }

  depends_on = [aws_cloudwatch_log_group.api]
}
