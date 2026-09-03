/**
 * Production environment.
 *
 * `useMock` is FALSE: the storefront reads its catalogue, product detail and
 * orders from the live Phase 3 backend (DynamoDB via the HTTP API) — so products
 * created/edited in the admin appear on the public store automatically, with no
 * further code change or redeploy. The in-code seed catalogue
 * (mock-*.repository / seed-products.data) is NOT used in production and never
 * overrides live data.
 *
 * Cognito + apiBaseUrl below are the real Phase 3 Terraform outputs (prod,
 * ap-southeast-1). None of these are secrets.
 */
export const environment = {
  production: true,
  useMock: false,
  apiBaseUrl: 'https://pgdqvclpdh.execute-api.ap-southeast-1.amazonaws.com',
  cognito: {
    region: 'ap-southeast-1',
    userPoolId: 'ap-southeast-1_cXyYAIR7v',
    clientId: '2fufp6tjtq6mv9a0108425s3p2',
  },
};
