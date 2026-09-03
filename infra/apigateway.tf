# -----------------------------------------------------------------------------
# API Gateway HTTP API — proxies /api/* to the single Lambda router.
# HTTP APIs are cheaper and simpler than REST APIs; ample for this workload.
# -----------------------------------------------------------------------------

resource "aws_apigatewayv2_api" "http" {
  name          = "${local.name}-api-${local.suffix}"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = local.cors_origins
    allow_methods = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
    allow_headers = ["content-type", "authorization"]
    max_age       = 3000
  }
}

resource "aws_apigatewayv2_integration" "api" {
  api_id                 = aws_apigatewayv2_api.http.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.api.invoke_arn
  payload_format_version = "2.0"
}

# Public storefront routes — unauthenticated.
resource "aws_apigatewayv2_route" "proxy" {
  api_id    = aws_apigatewayv2_api.http.id
  route_key = "ANY /api/{proxy+}"
  target    = "integrations/${aws_apigatewayv2_integration.api.id}"
}

# -----------------------------------------------------------------------------
# JWT authorizer — validates Cognito access tokens for /api/admin/*. API Gateway
# rejects unauthenticated/invalid tokens BEFORE the Lambda runs; the Lambda then
# additionally checks the MASTER_ADMIN group claim (defence in depth).
# -----------------------------------------------------------------------------
resource "aws_apigatewayv2_authorizer" "cognito" {
  api_id           = aws_apigatewayv2_api.http.id
  authorizer_type  = "JWT"
  identity_sources = ["$request.header.Authorization"]
  name             = "${local.name}-cognito-${local.suffix}"

  jwt_configuration {
    audience = [aws_cognito_user_pool_client.admin_web.id]
    issuer   = "https://cognito-idp.${var.aws_region}.amazonaws.com/${aws_cognito_user_pool.admin.id}"
  }
}

# Authenticated admin routes. More specific than ANY /api/{proxy+}, so admin
# requests match this (authorized) route rather than the public proxy.
resource "aws_apigatewayv2_route" "admin" {
  api_id             = aws_apigatewayv2_api.http.id
  route_key          = "ANY /api/admin/{proxy+}"
  target             = "integrations/${aws_apigatewayv2_integration.api.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.http.id
  name        = "$default"
  auto_deploy = true

  default_route_settings {
    throttling_burst_limit = 20
    throttling_rate_limit  = 50
  }

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_access.arn
    format = jsonencode({
      requestId    = "$context.requestId"
      httpMethod   = "$context.httpMethod"
      path         = "$context.path"
      status       = "$context.status"
      responseTime = "$context.responseLatency"
    })
  }
}

resource "aws_cloudwatch_log_group" "api_access" {
  name              = "/aws/apigateway/${local.name}-api-${local.suffix}"
  retention_in_days = var.log_retention_days
}

resource "aws_lambda_permission" "apigw" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.http.execution_arn}/*/*"
}
