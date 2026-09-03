provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "ezone"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}

locals {
  suffix = var.environment
  name   = "ezone"

  cors_origins = distinct(concat([var.storefront_origin], var.extra_cors_origins))
}
