# -----------------------------------------------------------------------------
# Secrets Manager — HitPay credentials.
#
# ONE secret holding a JSON document { "apiKey": "...", "webhookSalt": "..." }.
# A single secret costs $0.40/month vs $0.80 for two — the only fixed cost in the
# stack. The VALUE is set out-of-band so no credential ever lives in Git/state:
#
#   aws secretsmanager put-secret-value \
#     --secret-id ezone/hitpay-<env> \
#     --secret-string '{"apiKey":"test_...","webhookSalt":"..."}'
#
# The admin Payment Settings screen can also update it via the authenticated admin
# API (Angular → admin API → Lambda → Secrets Manager). Never returned to the
# browser — only a "configured / not configured" status is exposed.
#
# Use HitPay SANDBOX credentials until explicitly instructed otherwise.
# -----------------------------------------------------------------------------

resource "aws_secretsmanager_secret" "hitpay" {
  name                    = "ezone/hitpay-${local.suffix}"
  description             = "HitPay apiKey + webhookSalt (JSON). Sandbox until go-live. Set value via CLI or admin API."
  recovery_window_in_days = 7
}
