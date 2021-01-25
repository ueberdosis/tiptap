const path = require('path')
const globby = require('globby')
// const TypeDoc = require('typedoc')

// const packages = globby.sync('../packages/*', { onlyDirectories: true })
//   .map(name => name.replace('../packages/', ''))
//   .filter(name => name.startsWith('core'))
//   .map(name => {
//     const app = new TypeDoc.Application()

//     app.options.addReader(new TypeDoc.TSConfigReader())
//     app.options.addReader(new TypeDoc.TypeDocReader())
//     app.bootstrap({
//       mode: 'file',
//       ignoreCompilerErrors: true,
//       experimentalDecorators: true,
//       excludeExternals: true,
//       excludeNotExported: true,
//       excludeProtected: true,
//       excludePrivate: true,
//       // excludeNotDocumented: true,
//       exclude: [
//         '**/*.test.ts',
//         '**/__tests__/*',
//         '**/__mocks__/*',
//       ],
//     })

//     const project = app.convert(app.expandInputFiles([`../packages/${name}`]))

//     if (project) {
//       // app.generateDocs(project, `api/${name}`)
//       // app.generateJson(project, `api/${name}.json`)
//       const json = app.serializer.projectToObject(project)
//       return json
//     }

//     return null
//   })
//   .filter(package => !!package)

// const packages = globby.sync('../packages/*', { onlyDirectories: true })
//   .map(name => name.replace('../packages/', ''))
//   .map(name => {
//     // config.resolve.alias
//     // .set(`@tiptap/${name}`, path.resolve(`../packages/${name}/index.ts`))
//     return {
//       name: `@tiptap/${name}`,
//       module: require(`../packages/${name}/index.ts`),
//     }
//   })

module.exports = function (api) {

  api.setClientOptions({
    cwd: process.cwd(),
  })

  api.loadSource(({ addCollection }) => {
    /**
     * Generate pages for all demo components for testing purposes
     */
    globby.sync('./src/demos/**/index.vue').forEach(file => {

      const match = file.match(
        new RegExp(/\.\/src\/demos\/([\S]+)\/index.vue/i),
      )

      if (!match) {
        return
      }

      api.createPages(({ createPage }) => {
        createPage({
          // path: '/demos/Extensions/CharacterCount'
          path: `/demos/${match[1]}`,
          component: './src/templates/DemoPage/index.vue',
          context: {
            // name: 'Extensions/CharacterCount'
            name: match[1],
          },
        })
      })
    })

    /**
     * Read out all packages?
     */
    const appCollection = addCollection({ typeName: 'Package' })

    // packages.forEach(package => {
    //   appCollection.addNode(package)
    // })

    globby.sync('../packages/*', { onlyDirectories: true })
      .map(name => name.replace('../packages/', ''))
      .forEach(name => {
        appCollection.addNode({ name })
        // config.resolve.alias
        // .set(`@tiptap/${name}`, path.resolve(`../packages/${name}/index.ts`))
        // appCollection.addNode({
        //   name: `@tiptap/${name}`,
        //   module: require(`../packages/${name}/index.ts`),
        // })
      })

  })

  // api.createPages(({ createPage }) => {
  //   packages.forEach(package => {
  //     createPage({
  //       path: `/api/${package.name}`,
  //       component: './src/templates/ApiPage/index.vue',
  //       context: {
  //         package,
  //       },
  //     })
  //   })
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
}
