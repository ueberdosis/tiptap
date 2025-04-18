// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

const path = require('path')
const { globSync } = require('tinyglobby')
const webpackPreprocessor = require('@cypress/webpack-preprocessor')

module.exports = on => {
  const alias = {}

  globSync('../packages/*', { onlyDirectories: true })
    .map(name => name.replace('../packages/', ''))
    .forEach(name => {
      alias[`@tiptap/${name.split('/').slice(0, -1).join('/')}$`] = path.resolve(`../packages/${name}/src/index.ts`)
    })

  // Specifically resolve the pm package
  globSync('../packages/pm/*', { onlyDirectories: true })
    .map(name => name.replace('../packages/pm', ''))
    .forEach(name => {
      alias[`@tiptap/pm${name.split('/').slice(0, -1).join('/')}$`] = path.resolve(`../packages/pm/${name}/index.ts`)
    })
  // Specifically resolve the static-renderer package
  alias['@tiptap/static-renderer/json/html-string$'] = path.resolve(
    '../packages/static-renderer/src/json/html-string/index.ts',
  )
  alias['@tiptap/static-renderer/pm/html-string$'] = path.resolve(
    '../packages/static-renderer/src/pm/html-string/index.ts',
  )
  alias['@tiptap/static-renderer/pm/react$'] = path.resolve('../packages/static-renderer/src/pm/react/index.ts')
  alias['@tiptap/static-renderer/pm/markdown$'] = path.resolve('../packages/static-renderer/src/pm/markdown/index.ts')
  alias['@tiptap/static-renderer$'] = path.resolve('../packages/static-renderer/src/index.ts')

  const options = {
    webpackOptions: {
      module: {
        rules: [
          {
            test: /\.tsx?$/,
            loader: 'ts-loader',
            exclude: /node_modules/,
            options: {
              // tsconfig:
              configFile: path.resolve(__dirname, '..', 'tsconfig.json'),
            },
          },
          {
            test: /\.jsx?$/,
            use: 'babel-loader',
            exclude: /node_modules/,
          },
        ],
      },
      resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        alias,
        extensionAlias: {
          '.js': ['.js', '.ts'],
          '.jsx': ['.jsx', '.tsx'],
        },
      },
    },
  }

  on('file:preprocessor', webpackPreprocessor(options))
}
