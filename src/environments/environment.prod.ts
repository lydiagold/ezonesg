/**
 * Production environment.
 *
 * `useMock` stays TRUE until the Phase 2 API is deployed, so the live site keeps
 * serving the storefront from SEED data and never breaks mid-migration. After
 * `terraform apply`, set `apiBaseUrl` to the `api_base_url` output and flip
 * `useMock` to false in the same change.
 */
export const environment = {
  production: true,
  useMock: true,
  apiBaseUrl: 'https://REPLACE_WITH_API_ID.execute-api.ap-southeast-1.amazonaws.com',
};
