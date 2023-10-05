/* eslint-disable no-undef */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path')
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
      isolatedModules: true,
    },
  },
  testEnvironmentOptions: {
    url: 'https://bar.utoronto.ca/eplant',
  },
  moduleNameMapper: {
    '^@eplant/(.*)$': path.resolve(__dirname, 'Eplant/$1'),
  },
}
