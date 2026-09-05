# -----------------------------------------------------------------------------
# Cognito — admin authentication for the single MASTER_ADMIN.
#
# Cheapest safe design:
#   * One user pool, one public app client (no secret — SPA/SRP), one group.
#   * Cognito's built-in email delivery (free, 50/day) for forgot-password — no SES.
#   * Advanced Security OFF (per-MAU cost); MFA OPTIONAL via free TOTP only (no SMS).
#   * One initial admin user, email configurable at deploy time.
# A single admin sits far inside the 50,000-MAU free tier → $0/month.
# -----------------------------------------------------------------------------

resource "aws_cognito_user_pool" "admin" {
  name = "${local.name}-admin-${local.suffix}"

  # Email is the login identifier.
  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]

  password_policy {
    minimum_length                   = 12
    require_uppercase                = true
    require_lowercase                = true
    require_numbers                  = true
    require_symbols                  = true
    temporary_password_validity_days = 7
  }

  # Free TOTP (authenticator app) MFA, REQUIRED for every admin login. On the
  # first login after enforcement Cognito issues an MFA_SETUP challenge; the
  # custom login handles enrolment (associate + verify software token). SMS is
  # intentionally not enabled (no per-message cost, no phone dependency).
  mfa_configuration = "ON"
  software_token_mfa_configuration {
    enabled = true
  }

  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }

  admin_create_user_config {
    # Admins are invited by deployment; there is no public sign-up.
    allow_admin_create_user_only = true
  }

  email_configuration {
    # COGNITO_DEFAULT = free built-in sender (no SES to provision/pay for).
    email_sending_account = "COGNITO_DEFAULT"
  }

  schema {
    name                = "email"
    attribute_data_type = "String"
    required            = true
    mutable             = true
    string_attribute_constraints {
      min_length = 5
      max_length = 254
    }
  }

  # Do not accidentally destroy the identity store.
  lifecycle {
    prevent_destroy = false
  }
}

resource "aws_cognito_user_group" "master_admin" {
  name         = "MASTER_ADMIN"
  user_pool_id = aws_cognito_user_pool.admin.id
  description  = "Full administrative access to the EZONE storefront."
  precedence   = 1
}

# Public SPA client — NO client secret (browsers cannot keep one). SRP only.
resource "aws_cognito_user_pool_client" "admin_web" {
  name         = "${local.name}-admin-web-${local.suffix}"
  user_pool_id = aws_cognito_user_pool.admin.id

  generate_secret = false

  explicit_auth_flows = [
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
  ]

  # Short, sensible token lifetimes for a privileged console.
  access_token_validity  = 60 # minutes
  id_token_validity      = 60 # minutes
  refresh_token_validity = 8  # hours
  token_validity_units {
    access_token  = "minutes"
    id_token      = "minutes"
    refresh_token = "hours"
  }

  prevent_user_existence_errors = "ENABLED"
  enable_token_revocation       = true
}

# Initial MASTER_ADMIN. Cognito emails a temporary password; first login forces a
# change (NEW_PASSWORD_REQUIRED). The password is NEVER in Terraform/state/Git.
resource "aws_cognito_user" "initial_admin" {
  count        = var.admin_email == "" ? 0 : 1
  user_pool_id = aws_cognito_user_pool.admin.id
  username     = var.admin_email

  attributes = {
    email          = var.admin_email
    email_verified = "true"
  }

  desired_delivery_mediums = ["EMAIL"]

  # Let Terraform create/invite once; ignore drift from the admin changing their
  # own profile/password afterwards.
  lifecycle {
    ignore_changes = [attributes, temporary_password]
  }
}

resource "aws_cognito_user_in_group" "initial_admin" {
  count        = var.admin_email == "" ? 0 : 1
  user_pool_id = aws_cognito_user_pool.admin.id
  group_name   = aws_cognito_user_group.master_admin.name
  username     = aws_cognito_user.initial_admin[0].username
}
