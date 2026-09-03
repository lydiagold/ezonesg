/**
 * Production environment.
 *
 * `useMock` stays TRUE until the Phase 2 API is deployed, so the live site keeps
 * serving the storefront from SEED data and never breaks mid-migration. After
 * `terraform apply`, set `apiBaseUrl` to the `api_base_url` output, fill the
 * `cognito` block from the `cognito` output, and flip `useMock` to false in the
 * same change. None of the cognito values are secrets.
 */
export const environment = {
  production: true,
  useMock: true,
  apiBaseUrl: 'https://REPLACE_WITH_API_ID.execute-api.ap-southeast-1.amazonaws.com',
  cognito: {
    region: 'ap-southeast-1',
    userPoolId: '',   // Terraform output: cognito.user_pool_id
    clientId: '',     // Terraform output: cognito.web_client_id
  },
};
