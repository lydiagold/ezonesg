/**
 * Development environment (default). Uses the in-memory mock repositories so the
 * app runs with SEED data and no backend. Point `apiBaseUrl` at your deployed
 * HTTP API and set `useMock: false` to run against real DynamoDB locally.
 */
export const environment = {
  production: false,
  useMock: true,
  apiBaseUrl: 'http://localhost:3000',
};
