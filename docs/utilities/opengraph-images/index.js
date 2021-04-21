const fs = require('fs')
const path = require('path')
const { createCanvas, registerFont, loadImage } = require('canvas')

const multilineText = function (
  ctx,
  text,
  x,
  y,
  maxWidth,
  lineHeight,
  start = 'top',
) {
  const words = text.split(' ')

  let numberOfLines = 1

  if (start === 'bottom') {
    let currentLine = ''

    for (let index = 0; index < words.length; index += 1) {
      const temporaryLine = `${currentLine + words[index]} `
      const temporaryWidth = ctx.measureText(temporaryLine).width

      if (temporaryWidth > maxWidth && index > 0) {
        numberOfLines += 1
        currentLine = `${words[index]} `
      } else {
        currentLine = temporaryLine
      }
    }

    const textHeight = numberOfLines * lineHeight
    y = ctx.canvas.height - y - textHeight
  }

  let currentLine = ''

  for (let index = 0; index < words.length; index += 1) {
    const testLine = `${currentLine + words[index]} `
    const metrics = ctx.measureText(testLine)
    const testWidth = metrics.width

    if (testWidth > maxWidth && index > 0) {
      ctx.fillText(currentLine, x, y)
      currentLine = `${words[index]} `
      y += lineHeight
    } else {
      currentLine = testLine
    }
  }

  ctx.fillText(currentLine, x, y)
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

const width = 1280
const height = 640
const border = 50

registerFont('fonts/Inter-Regular.otf', { family: 'InterRegular' })
registerFont('fonts/Inter-Bold.otf', { family: 'InterBold' })

function writeImageFile(canvas, output) {
  const buffer = canvas.toBuffer('image/png')
  const directory = output.substring(0, output.lastIndexOf('/'))

  fs.mkdir(directory, { recursive: true }, error => {
    if (error) {
      throw error
    }

    fs.writeFileSync(output, buffer)
  })
}

module.exports = {
  async createDefaultOpenGraphImage(text, output) {
    // canvas
    const canvas = createCanvas(width, height)
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, height)

    // logo
    const image = await loadImage(path.resolve(__dirname, 'logo.png'))
    ctx.drawImage(image, border, border)

    // title
    const lineHeight = 110
    ctx.textBaseline = 'top'
    ctx.fillStyle = '#000000'
    ctx.font = '70pt InterBold'
    multilineText(ctx, text, border, border, width - 7 * border, lineHeight, 'bottom')

    writeImageFile(canvas, output)
  },
  async createSpecificOpenGraphImage(text, content = '', output) {
    const readingTime = calculateReadingTime(content)

    // canvas
    const canvas = createCanvas(width, height)
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, height)

    // logo
    const image = await loadImage(path.resolve(__dirname, 'logo.png'))
    ctx.drawImage(image, border, border)

    // title
    const lineHeight = 90
    ctx.textBaseline = 'top'
    ctx.fillStyle = '#000000'
    ctx.font = '60pt InterBold'
    multilineText(ctx, text, border, border + 80, width - 5 * border, lineHeight, 'bottom')

    // reading time
    ctx.textBaseline = 'bottom'
    ctx.fillStyle = '#666666'
    ctx.font = '32pt InterRegular'
    ctx.fillText(readingTime, border, height - border)

    writeImageFile(canvas, output)
  },
}
