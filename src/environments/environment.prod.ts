/**
 * Production environment.
 *
 * `useMock` stays TRUE for now: the public storefront keeps serving the built-in
 * seed catalogue so ezone.sg/shop is never empty. The /admin area does NOT depend
 * on `useMock` — it talks to `apiBaseUrl` + Cognito directly — so admin works
 * against the live backend while the storefront stays on seed data. Flip `useMock`
 * to false once the production catalogue has been populated via the admin.
 *
 * Cognito + apiBaseUrl below are the real Phase 3 Terraform outputs (prod,
 * ap-southeast-1). None of these are secrets.
 */
export const environment = {
  production: true,
  useMock: true,
  apiBaseUrl: 'https://pgdqvclpdh.execute-api.ap-southeast-1.amazonaws.com',
  cognito: {
    region: 'ap-southeast-1',
    userPoolId: 'ap-southeast-1_cXyYAIR7v',
    clientId: '2fufp6tjtq6mv9a0108425s3p2',
  },
};
