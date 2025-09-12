module.exports = {
  testEnvironment: 'node',
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.integration.test.js',
    '**/tests/**/*.e2e.test.js'
  ],
  testTimeout: 300000, // 5 minutes for browser automation tests
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  collectCoverageFrom: [
    'browser-scraper.js',
    'test-scraper-server.js',
    'shared/src/**/*.js',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/coverage/**'
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  coverageDirectory: 'coverage',
  verbose: true,
  // Separate test suites
  projects: [
    {
      displayName: 'unit',
      testMatch: ['**/tests/**/*.test.js'],
      testTimeout: 30000
    },
    {
      displayName: 'integration',
      testMatch: ['**/tests/**/*.integration.test.js'],
      testTimeout: 300000
    },
    {
      displayName: 'e2e',
      testMatch: ['**/tests/**/*.e2e.test.js'],
      testTimeout: 300000
    }
  ]
};
