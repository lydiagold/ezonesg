variable "aws_region" {
  description = "AWS region (Singapore)."
  type        = string
  default     = "ap-southeast-1"
}

variable "environment" {
  description = "Deployment environment; suffixes all resource names."
  type        = string
  default     = "dev"

  validation {
    condition     = contains(["dev", "prod"], var.environment)
    error_message = "environment must be 'dev' or 'prod'."
  }
}

variable "storefront_origin" {
  description = "Storefront origin used for CORS and payment return URLs."
  type        = string
  default     = "https://ezone.sg"
}

variable "extra_cors_origins" {
  description = "Additional allowed CORS origins (e.g. Amplify preview / localhost)."
  type        = list(string)
  default     = ["http://localhost:4200"]
}

variable "admin_email" {
  description = <<-EOT
    Email of the initial MASTER_ADMIN. Cognito emails a temporary password on
    apply; first login forces a change. Leave empty to skip creating the user
    (e.g. create it later with scripts/create-dev-admin). Never commit a password.
  EOT
  type        = string
  default     = ""
}

variable "log_retention_days" {
  description = "CloudWatch Logs retention (days) — kept short to bound cost."
  type        = number
  default     = 14
}

variable "max_upload_bytes" {
  description = "Maximum allowed image upload size for presigned S3 PUTs."
  type        = number
  default     = 5242880 # 5 MB
}
