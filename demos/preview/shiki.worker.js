import * as shiki from 'shiki'
import onigasm from 'shiki/dist/onigasm.wasm?url'
import theme from 'shiki/themes/material-darker.json'
import langHTML from 'shiki/languages/html.tmLanguage.json'
import langJS from 'shiki/languages/javascript.tmLanguage.json'
import langJSX from 'shiki/languages/jsx.tmLanguage.json'
import langTS from 'shiki/languages/typescript.tmLanguage.json'
import langTSX from 'shiki/languages/tsx.tmLanguage.json'
import langVueHTML from 'shiki/languages/vue-html.tmLanguage.json'
import langVue from 'shiki/languages/vue.tmLanguage.json'
import langCSS from 'shiki/languages/css.tmLanguage.json'
import langSCSS from 'shiki/languages/scss.tmLanguage.json'

let highlighter = null

async function init() {
  if (highlighter) {
    return highlighter
  }

  const arrayBuffer = await fetch(onigasm).then(response => response.arrayBuffer())

  shiki.setOnigasmWASM(arrayBuffer)

  highlighter = await shiki.getHighlighter({
    theme,
    langs: [
      {
        id: 'html',
        scopeName: langHTML.scopeName,
        grammar: langHTML,
        embeddedLangs: ['javascript', 'css'],
      },
      {
        id: 'javascript',
        scopeName: langJS.scopeName,
        grammar: langJS,
        aliases: ['js'],
      },
      {
        id: 'jsx',
        scopeName: langJSX.scopeName,
        grammar: langJSX,
      },
      {
        id: 'typescript',
        scopeName: langTS.scopeName,
        grammar: langTS,
        aliases: ['ts'],
      },
      {
        id: 'tsx',
        scopeName: langTSX.scopeName,
        grammar: langTSX,
      },
      {
        id: 'vue-html',
        scopeName: langVueHTML.scopeName,
        grammar: langVueHTML,
        embeddedLangs: ['vue', 'javascript'],
      },
      {
        id: 'vue',
        scopeName: langVue.scopeName,
        grammar: langVue,
        embeddedLangs: ['json', 'markdown', 'pug', 'haml', 'vue-html', 'sass', 'scss', 'less', 'stylus', 'postcss', 'css', 'typescript', 'coffee', 'javascript'],
      },
      {
        id: 'css',
        scopeName: langCSS.scopeName,
        grammar: langCSS,
      },
      {
        id: 'scss',
        scopeName: langSCSS.scopeName,
        grammar: langSCSS,
        embeddedLangs: ['css'],
      },
    ],
  })

  return highlighter
}

self.addEventListener('message', async event => {
  init().then(() => {
    const { code, language } = event.data
    const html = highlighter.codeToHtml(code, language)

    self.postMessage({ code, language, html })
  })
})
