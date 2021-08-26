<template>
  <div v-if="html" v-html="html" />
  <pre v-else><code>{{ code }}</code></pre>
</template>

<script>
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

export default {
  props: {
    code: {
      default: '',
      type: String,
    },

    language: {
      default: 'js',
      type: String,
    },
  },

  data() {
    return {
      html: null,
      highlighter: window?.highlighter,
    }
  },

  watch: {
    code: {
      immediate: true,
      handler() {
        this.render()
      },
    },

    highlighter: {
      immediate: true,
      handler() {
        this.render()
      },
    },
  },

  methods: {
    render() {
      try {
        requestAnimationFrame(() => {
          this.html = this.highlighter?.codeToHtml(this.code, this.language)
        })
      } catch {
        console.warn(`[shiki]: missing language: ${this.language}`)
      }
    },

    async initHighlighter() {
      if (window.highlighter) {
        return
      }

      const arrayBuffer = await fetch(onigasm).then(response => response.arrayBuffer())

      shiki.setOnigasmWASM(arrayBuffer)

      const highlighter = await shiki.getHighlighter({
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

      window.highlighter = highlighter
      this.highlighter = highlighter
    },
  },

  created() {
    this.initHighlighter()
  },
}
</script>

<style>
.shiki {
  background-color: transparent !important;
}
</style>
