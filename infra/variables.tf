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
