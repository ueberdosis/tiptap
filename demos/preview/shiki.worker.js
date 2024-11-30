import * as shiki from 'shiki'

let highlighter = null

async function init() {
  if (highlighter) {
    return highlighter
  }

  highlighter = await shiki.createHighlighter({
    themes: ['material-theme-darker'],
    langs: [
      'html',
      'js',
      'jsx',
      'ts',
      'tsx',
      'css',
      'vue-html',
      'vue',
      'scss',
    ],
  })

  return highlighter
}

// eslint-disable-next-line
self.addEventListener('message', async event => {
  init().then(async () => {
    const { code, language } = event.data

    await highlighter.loadLanguage(language)

    const html = highlighter.codeToHtml(code, { lang: language, theme: 'material-theme-darker' })

    // eslint-disable-next-line
    self.postMessage({ code, language, html })
  })
})
