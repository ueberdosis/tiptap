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

module.exports = function (api) {

  api.setClientOptions({
    cwd: process.cwd(),
  })

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
    if (process.env.NODE_ENV !== 'production') {
      return
    }

    if (options.internal.typeName !== 'DocPage') {
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
