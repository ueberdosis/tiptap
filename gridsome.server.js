const path = require('path')
const globby = require('globby')

module.exports = function (api) {
  api.chainWebpack(config => {
    config.resolve.extensions
      .add('.ts')

    config.module
      .rule('typescript')
        .test(/\.tsx?$/)
        .use()
          .loader('ts-loader')
          .options({ appendTsSuffixTo: [/\.vue$/] })

    config.module
      .rule('jsx')
        .test(/\.jsx?$/)
        .use()
          .loader('babel-loader')
          // .options({ appendTsSuffixTo: [/\.vue$/] })
    
    globby.sync('./packages/*', { onlyDirectories: true })
      .map(name => name.replace('./packages/', ''))
      .forEach(name => {
        config.resolve.alias
          .set(`@tiptap/${name}`, path.resolve(`./packages/${name}`))
      })
  })
}
