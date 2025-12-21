module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./tests/e2e/setup.ts'],
  testTimeout: 30000,
  testMatch: ['**/tests/e2e/**/*.test.ts', '**/tests/unit/**/*.test.ts', '**/tests/security/**/*.test.ts'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '<rootDir>/tests/e2e/archived_tests/'
  ],
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
};
