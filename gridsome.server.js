const path = require('path')
const globby = require('globby')

module.exports = function (api) {
  api.chainWebpack(config => {
    config.resolve.extensions
      .add('.ts')
    
    globby.sync('./packages/*', { onlyDirectories: true })
      .map(name => name.replace('./packages/tiptap-', ''))
      .forEach(name => {
        config.resolve.alias
          .set(`@tiptap/${name}`, path.resolve(`./packages/tiptap-${name}`))
      })
  })
}
