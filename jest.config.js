const path = require('path')
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.test.json',
    },
  },
  testEnvironmentOptions: {
    url: 'https://bar.utoronto.ca/eplant',
  },
  moduleNameMapper: {
    '^@eplant/(.*)$': path.resolve(__dirname, 'Eplant/$1'),
    '^@stories/(.*)$': path.resolve(__dirname, 'stories/$1'),
  },
}
