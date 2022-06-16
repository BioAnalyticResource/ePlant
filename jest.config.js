const { pathsToModuleNameMapper } = require('ts-jest')
const { compilerOptions } = require('./tsconfig')
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  testURL: 'http://bar.utoronto.ca/eplant',
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: __dirname,
  }),
}
