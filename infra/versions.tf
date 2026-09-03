terraform {
  required_version = ">= 1.5"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.4"
    }
  }

  # For team use, configure a remote backend (S3 + DynamoDB lock). Left local by
  # default so an initial `terraform plan` works without pre-provisioned state.
  # backend "s3" {
  #   bucket         = "ezone-terraform-state"
  #   key            = "ezone/terraform.tfstate"
  #   region         = "ap-southeast-1"
  #   dynamodb_table = "ezone-terraform-locks"
  #   encrypt        = true
  # }
}
