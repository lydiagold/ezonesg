# -----------------------------------------------------------------------------
# Secrets Manager — HitPay credentials (consumed in Phase 4).
#
# The secret CONTAINERS are created here; their VALUES are set out-of-band so no
# credential ever lives in Git or Terraform state. After apply:
#
#   aws secretsmanager put-secret-value \
#     --secret-id ezone/hitpay/api-key-<env> --secret-string 'test_...'
#   aws secretsmanager put-secret-value \
#     --secret-id ezone/hitpay/webhook-salt-<env> --secret-string '...'
#
# Use HitPay SANDBOX credentials until explicitly instructed otherwise.
# -----------------------------------------------------------------------------

resource "aws_secretsmanager_secret" "hitpay_api_key" {
  name                    = "ezone/hitpay/api-key-${local.suffix}"
  description             = "HitPay API key (sandbox until go-live). Set value via CLI."
  recovery_window_in_days = 7
}

resource "aws_secretsmanager_secret" "hitpay_webhook_salt" {
  name                    = "ezone/hitpay/webhook-salt-${local.suffix}"
  description             = "HitPay webhook salt for signature verification. Set value via CLI."
  recovery_window_in_days = 7
}
