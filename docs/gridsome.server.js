const path = require('path')
const globby = require('globby')
const { createDefaultOpenGraphImage, createSpecificOpenGraphImage } = require('./utilities/opengraph-images')

createDefaultOpenGraphImage('The headless editor framework for web artisans.', 'static/images/og-image.png')

module.exports = function (api) {

  api.setClientOptions({
    cwd: process.cwd(),
  })

  let numberOfPages = 0
  let numberOfDemos = 0
  let numberOfPosts = 0

  api.loadSource(() => {
    /**
     * Generate pages for all demo components for testing purposes
     */
    const demos = []

    globby.sync('./src/demos/**/index.(vue|jsx)').forEach(file => {
      const match = file.match(
        new RegExp(/\.\/src\/demos\/([\S]+)\/index.(vue|jsx)/i),
      )

      if (!match) {
        return
      }

      demos.push(match[1])
    })

    numberOfDemos = demos.length

    api.createPages(({ createPage }) => {
      createPage({
        path: '/demos',
        component: './src/templates/DemoPages/index.vue',
        context: {
          demos,
        },
      })

      demos.forEach(name => {
        createPage({
          path: `/demos/${name}`,
          component: './src/templates/DemoPage/index.vue',
          context: {
            name,
          },
        })
      })
    })
  })

  api.chainWebpack(config => {
    config.resolve.extensions
      .add('.ts')
      .add('.tsx')
      .add('.jsx')

    config.module
      .rule('typescript')
      .test(/\.tsx?$/)
      .use()
      .loader('ts-loader')
      .options({ transpileOnly: false, appendTsSuffixTo: [/\.vue$/] })

    config.module
      .rule('jsx')
      .test(/\.jsx$/)
      .use()
      .loader('babel-loader')

    globby.sync('../packages/*', { onlyDirectories: true })
      .map(name => name.replace('../packages/', ''))
      .forEach(name => {
        config.resolve.alias
          .set(`@tiptap/${name}`, path.resolve(`../packages/${name}/src/index.ts`))
      })
  })

  api.onCreateNode(options => {
    if (options.internal.typeName === 'DocPage') {
      numberOfPages += 1

      if (process.env.NODE_ENV === 'production') {
        createSpecificOpenGraphImage(
          options.title,
          options.content,
          `static/images${options.path}og-image.png`,
        )
      }
    }

    if (options.internal.typeName === 'Post') {
      numberOfPosts += 1

      if (process.env.NODE_ENV === 'production') {
        createSpecificOpenGraphImage(
          options.title,
          options.content,
          `static/images${options.path}og-image.png`,
        )
      }
    }
  })

  api.configureServer(() => {
    console.log(`[STATS] ${numberOfPages} pages`)
    console.log(`[STATS] ${numberOfDemos} demos`)
    console.log(`[STATS] ${numberOfPosts} posts`)
  })
}
