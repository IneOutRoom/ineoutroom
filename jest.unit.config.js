module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/__tests__/unit'],
  testMatch: [
    '<rootDir>/__tests__/unit/**/*.{js,jsx,ts,tsx}'
  ],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'esbuild-jest'
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/client/src/$1',
    '^@shared/(.*)$': '<rootDir>/shared/$1',
    '^@assets/(.*)$': '<rootDir>/attached_assets/$1',
    '\\.(css|scss|sass)$': '<rootDir>/__mocks__/styleMock.js',
    '\\.(jpg|jpeg|png|gif|ico|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/__mocks__/fileMock.js'
  },
  transformIgnorePatterns: [
    '/node_modules/(?!.*)/'
  ],
  collectCoverageFrom: [
    'client/src/**/*.{js,jsx,ts,tsx}',
    '!client/src/**/*.d.ts'
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