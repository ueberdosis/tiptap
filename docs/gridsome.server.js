const fs = require('fs')
const { createCanvas, registerFont } = require('canvas')
const path = require('path')
const globby = require('globby')

registerFont('fonts/Inter-Regular.otf', { family: 'InterRegular' })
registerFont('fonts/Inter-Medium.otf', { family: 'InterMedium' })

const wrapText = function (context, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ')
  let line = ''

  for (let n = 0; n < words.length; n += 1) {
    const testLine = `${line + words[n]} `
    const metrics = context.measureText(testLine)
    const testWidth = metrics.width
    if (testWidth > maxWidth && n > 0) {
      context.fillText(line, x, y)
      line = `${words[n]} `
      y += lineHeight
    } else {
      line = testLine
    }
  }
  context.fillText(line, x, y)
}

const calculateReadingTime = function (text) {
  const wordsPerMinute = 200
  const textLength = text.split(' ').length

  if (textLength > 0) {
    const value = Math.ceil(textLength / wordsPerMinute)

    if (value === 1) {
      return `${value} minute`
    }

    return `${value} minutes`
  }
}

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

  // Generate OpenGraph images for all pages
  api.onCreateNode(options => {
    // if (process.env.NODE_ENV !== 'production') {
    //   return null
    // }

    if (options?.internal?.typeName !== 'DocPage') {
      return
    }

    const imagePath = `static/images${options.path}`
    const imageFile = `static/images${options.path}og-image.png`

    // console.log(`Found Post “${options.title}” in ${options.internal.origin} …`)

    const width = 1200
    const height = 630

    const border = 40

    const canvas = createCanvas(width, height)
    const context = canvas.getContext('2d')

    // background
    context.fillStyle = '#000000'
    context.fillRect(0, 0, width, height)

    // project
    const project = 'tiptap documentation'
    context.textBaseline = 'top'
    context.fillStyle = '#666666'
    context.font = '32pt InterRegular'
    context.fillText(project, border, border)

    // title
    const { title } = options
    const lineHeight = 96
    context.textBaseline = 'top'
    context.fillStyle = '#ffffff'
    context.font = '58pt InterMedium'
    wrapText(context, title, border, border + 60 + border, width - border - border, lineHeight)

    // reading time
    const readingTime = calculateReadingTime(options.content)
    context.textBaseline = 'bottom'
    context.fillStyle = '#666666'
    context.font = '32pt InterRegular'
    context.fillText(readingTime, border, height - border)

    // store
    const buffer = canvas.toBuffer('image/png')

    fs.mkdir(imagePath, { recursive: true }, error => {
      if (error) {
        throw error
      }

      fs.writeFileSync(imageFile, buffer)

      // console.log(`OpenGraph image generated (${imageFile}).`)
    })
  })
}
