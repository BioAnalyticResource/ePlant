const { pathsToModuleNameMapper } = require('ts-jest')
const { compilerOptions } = require('./tsconfig')
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.test.json',
    },
  },
  testEnvironmentOptions: {
    url: 'https://bar.utoronto.ca/eplant',
  },
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: __dirname,
  }),
}
