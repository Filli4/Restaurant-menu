// jest.config.cjs
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'], // Make sure this path is correct
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  clearMocks: true,
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
  ],
  roots: ['<rootDir>/__tests__'],
  testMatch: [
    '<rootDir>/__tests__/**/*.(test|spec).[jt]s?(x)',
  ],
};

module.exports = createJestConfig(customJestConfig);