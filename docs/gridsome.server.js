const path = require('path')
const globby = require('globby')
const TypeDoc = require('typedoc')

module.exports = function (api) {

  // api.loadSource(({ addCollection }) => {
  //   const appCollection = addCollection({ typeName: 'Package' })

  //   globby.sync('../packages/*', { onlyDirectories: true })
  //     .map(name => name.replace('../packages/', ''))
  //     .filter(name => name.startsWith('core'))
  //     .forEach(name => {
  //       const app = new TypeDoc.Application()

  //       app.options.addReader(new TypeDoc.TSConfigReader())
  //       app.options.addReader(new TypeDoc.TypeDocReader())
  //       app.bootstrap({
  //         ignoreCompilerErrors: true,
  //         experimentalDecorators: true,
  //         excludeExternals: true,
  //         excludeNotExported: true,
  //         excludeProtected: true,
  //         excludePrivate: true,
  //         // excludeNotDocumented: true,
  //         exclude: [
  //           "**/*.test.ts",
  //           "**/__tests__/*",
  //           "**/__mocks__/*"
  //         ],
  //       })

  //       const project = app.convert(app.expandInputFiles([`../packages/${name}`]))

  //       if (project) {
  //         app.generateJson(project, `api/${name}.json`)
  //         const json = app.serializer.projectToObject(project)
  //         appCollection.addNode(json)
  //       }
  //     })
  // })

  api.chainWebpack(config => {
    config.resolve.extensions
      .add('.ts')
      .add('.jsx')

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

    globby.sync('../packages/*', { onlyDirectories: true })
      .map(name => name.replace('../packages/', ''))
      .forEach(name => {
        config.resolve.alias
          .set(`@tiptap/${name}`, path.resolve(`../packages/${name}`))
      })
  })
}
