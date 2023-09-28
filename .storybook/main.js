import process from 'process'
import path from 'path'
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin'

module.exports = {
  stories: [
    '../stories/**/*.stories.mdx',
    '../stories/**/*.stories.@(js|jsx|ts|tsx)',
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-jest',
  ],
  framework: '@storybook/react',
  core: {
    builder: '@storybook/builder-webpack5',
  },
  // Add tsconfig-paths to the webpack config
  webpackFinal: (config) => {
    config.module.rules.push({
      test: /\.tsx?$/,
      loader: 'ts-loader',
    })
    config.resolve.plugins = [
      new TsconfigPathsPlugin({
        configFile: path.resolve(__dirname, '../tsconfig.json'),
      }),
    ]
    console.log(config)

    config.resolve.symlinks = false
    return config
  },
}
