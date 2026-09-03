#!/usr/bin/env bash
#
# create-dev-admin — create/invite ONE Cognito MASTER_ADMIN for EZONE.
#
# For local/dev bootstrap, or to (re)create the admin after `terraform apply`.
# No password is ever stored in this repo. Cognito emails a temporary password
# (or you may supply one interactively); the first login forces a change.
#
# Usage:
#   ADMIN_EMAIL=admin@ezone.sg ./scripts/create-dev-admin.sh
#
# Optional env:
#   USER_POOL_ID   Cognito user pool id. If unset, read from `terraform output`.
#   AWS_REGION     Defaults to ap-southeast-1.
#   SET_PASSWORD=1 Prompt for a temporary password instead of Cognito emailing one.
#
# Requires: awscli v2, jq (only if USER_POOL_ID is derived from terraform).
set -euo pipefail

: "${ADMIN_EMAIL:?Set ADMIN_EMAIL, e.g. ADMIN_EMAIL=admin@ezone.sg ./scripts/create-dev-admin.sh}"
AWS_REGION="${AWS_REGION:-ap-southeast-1}"
GROUP="MASTER_ADMIN"

# Resolve the user pool id from Terraform outputs if not provided.
if [[ -z "${USER_POOL_ID:-}" ]]; then
  if command -v terraform >/dev/null && [[ -d "$(dirname "$0")/../infra" ]]; then
    USER_POOL_ID="$(terraform -chdir="$(dirname "$0")/../infra" output -json cognito 2>/dev/null | jq -r '.user_pool_id')" || true
  fi
fi
: "${USER_POOL_ID:?Could not determine USER_POOL_ID. Pass it explicitly (see infra output 'cognito').}"

echo "Pool:  $USER_POOL_ID ($AWS_REGION)"
echo "Admin: $ADMIN_EMAIL"

CREATE_ARGS=(
  --user-pool-id "$USER_POOL_ID"
  --username "$ADMIN_EMAIL"
  --user-attributes Name=email,Value="$ADMIN_EMAIL" Name=email_verified,Value=true
  --region "$AWS_REGION"
)

if [[ "${SET_PASSWORD:-0}" == "1" ]]; then
  # Read a temporary password without echoing it; never persisted anywhere.
  read -rs -p "Temporary password (min 12, upper/lower/number/symbol): " TEMP_PW; echo
  CREATE_ARGS+=(--temporary-password "$TEMP_PW" --message-action SUPPRESS)
else
  # Cognito generates a temporary password and emails it to the admin.
  CREATE_ARGS+=(--desired-delivery-mediums EMAIL)
fi

echo "Creating user…"
aws cognito-idp admin-create-user "${CREATE_ARGS[@]}" >/dev/null || {
  echo "User may already exist; continuing to group assignment."; }

echo "Adding to group $GROUP…"
aws cognito-idp admin-add-user-to-group \
  --user-pool-id "$USER_POOL_ID" \
  --username "$ADMIN_EMAIL" \
  --group-name "$GROUP" \
  --region "$AWS_REGION"

unset TEMP_PW 2>/dev/null || true
echo "Done. $ADMIN_EMAIL is a $GROUP. First login will force a password change."
