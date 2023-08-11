/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

/** @type {import('jest').Config} */
const config = {
  preset: 'ts-jest',
  moduleDirectories: ['node_modules'],
  testEnvironment: 'jsdom',
  // following 2 options are required otherwise the typescript compiler
  // will complain about usage of import statement outside a module
  transform: {
    '^.+\\.(js|ts|tsx)?$': 'ts-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(multiformats)/)',
  ],
};

module.exports = config;
