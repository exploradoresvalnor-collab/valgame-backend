module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // No E2E setup here to avoid DB spin-up for unit-only runs
  setupFilesAfterEnv: [],
  testTimeout: 30000,
  testMatch: ['**/tests/unit/**/*.test.ts'],
  testPathIgnorePatterns: ['/node_modules/'],
  verbose: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
};