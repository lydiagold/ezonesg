# -----------------------------------------------------------------------------
# DynamoDB — one table per logical entity (maintainable over single-table).
# On-demand billing: effectively free at low traffic, no capacity to manage.
# -----------------------------------------------------------------------------

resource "aws_dynamodb_table" "products" {
  name         = "${local.name}-products-${local.suffix}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }
  attribute {
    name = "slug"
    type = "S"
  }
  attribute {
    name = "category"
    type = "S"
  }

  global_secondary_index {
    name            = "slug-index"
    hash_key        = "slug"
    projection_type = "ALL"
  }
  global_secondary_index {
    name            = "category-index"
    hash_key        = "category"
    projection_type = "ALL"
  }

  point_in_time_recovery { enabled = true }
}

resource "aws_dynamodb_table" "categories" {
  name         = "${local.name}-categories-${local.suffix}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "slug"

  attribute {
    name = "slug"
    type = "S"
  }
}

resource "aws_dynamodb_table" "orders" {
  name         = "${local.name}-orders-${local.suffix}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "orderReference"

  attribute {
    name = "orderReference"
    type = "S"
  }
  attribute {
    name = "status"
    type = "S"
  }
  attribute {
    name = "createdAt"
    type = "S"
  }

  # Admin order listing/filtering by status, newest first.
  global_secondary_index {
    name            = "status-index"
    hash_key        = "status"
    range_key       = "createdAt"
    projection_type = "ALL"
  }

  point_in_time_recovery { enabled = true }
}

resource "aws_dynamodb_table" "payments" {
  name         = "${local.name}-payments-${local.suffix}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "providerPaymentId"

  attribute {
    name = "providerPaymentId"
    type = "S"
  }
  attribute {
    name = "orderReference"
    type = "S"
  }

  global_secondary_index {
    name            = "order-index"
    hash_key        = "orderReference"
    projection_type = "ALL"
  }

  point_in_time_recovery { enabled = true }
}

resource "aws_dynamodb_table" "settings" {
  name         = "${local.name}-settings-${local.suffix}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "key"

  attribute {
    name = "key"
    type = "S"
  }
}
