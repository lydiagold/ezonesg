# -----------------------------------------------------------------------------
# IAM — least-privilege execution role for the API Lambda.
# Phase 2 grants CloudWatch Logs + scoped DynamoDB only. S3 (presign) and Secrets
# Manager (HitPay) permissions are added in the phases that use them.
# -----------------------------------------------------------------------------

data "aws_iam_policy_document" "lambda_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "api_lambda" {
  name               = "${local.name}-api-lambda-${local.suffix}"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume.json
}

resource "aws_iam_role_policy_attachment" "lambda_logs" {
  role       = aws_iam_role.api_lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

data "aws_iam_policy_document" "dynamodb_access" {
  statement {
    sid = "TableAccess"
    actions = [
      "dynamodb:GetItem",
      "dynamodb:PutItem",
      "dynamodb:UpdateItem",
      "dynamodb:Query",
      "dynamodb:Scan",
    ]
    resources = [
      aws_dynamodb_table.products.arn,
      aws_dynamodb_table.categories.arn,
      aws_dynamodb_table.orders.arn,
      aws_dynamodb_table.payments.arn,
      aws_dynamodb_table.settings.arn,
    ]
  }

  statement {
    sid       = "IndexAccess"
    actions   = ["dynamodb:Query"]
    resources = ["${aws_dynamodb_table.products.arn}/index/*", "${aws_dynamodb_table.orders.arn}/index/*", "${aws_dynamodb_table.payments.arn}/index/*"]
  }
}

resource "aws_iam_role_policy" "dynamodb_access" {
  name   = "${local.name}-dynamodb-${local.suffix}"
  role   = aws_iam_role.api_lambda.id
  policy = data.aws_iam_policy_document.dynamodb_access.json
}
