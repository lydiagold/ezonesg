/**
 * Development environment (default). Uses the in-memory mock repositories so the
 * app runs with SEED data and no backend. Point `apiBaseUrl` at your deployed
 * HTTP API and set `useMock: false` to run against real DynamoDB locally.
 *
 * `cognito` is only needed for the /admin area. Fill it from the Terraform
 * `cognito` output after `terraform apply`. The admin UI shows a clear
 * "not configured" message until then; none of these values are secrets.
 */
export const environment = {
  production: false,
  useMock: true,
  apiBaseUrl: 'http://localhost:3000',
  cognito: {
    region: 'ap-southeast-1',
    userPoolId: '',   // e.g. ap-southeast-1_xxxxxxxxx
    clientId: '',     // app client id (no secret)
  },
};
