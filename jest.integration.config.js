module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/__tests__/integration'],
  testMatch: [
    '<rootDir>/__tests__/integration/**/*.{js,jsx,ts,tsx}'
  ],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'esbuild-jest'
  },
  setupFilesAfterEnv: ['<rootDir>/jest.integration.setup.js'],
  transformIgnorePatterns: [
    '/node_modules/(?!.*)/'
  ],
  collectCoverageFrom: [
    'server/**/*.{js,jsx,ts,tsx}',
    '!server/**/*.d.ts'
  ],
  coverageThreshold: {
    global: {
      statements: 70,
      branches: 70,
      functions: 70,
      lines: 70
    }
  }
};