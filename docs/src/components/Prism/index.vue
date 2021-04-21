<template>
  <pre :class="`language-${language}`" :data-line="highlight"><code :class="`language-${language}`"><slot /></code></pre>
</template>

<script>
import Prism from 'prismjs'
import 'prismjs/plugins/line-highlight/prism-line-highlight.js'
import 'prismjs/plugins/line-highlight/prism-line-highlight.css'

export default {
  props: {
    language: {
      default: 'js',
      type: String,
    },

    highlight: {
      type: String,
      default: null,
    },
  },

  watch: {
    highlight() {
      this.$nextTick(this.highlightCode)
    },
  },

  methods: {
    highlightCode() {
      Prism.highlightAllUnder(this.$el)
    },
  },

  mounted() {
    this.highlightCode()
  },
}
</script>
