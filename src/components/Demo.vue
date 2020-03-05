<template>
  <div>
    <component :is="mainFile" v-if="mainFile" />
    <div v-for="(file, index) in files" :key="index">
      <p>
        {{ file.name }}
      </p>
      <pre :class="`language-${file.highlight}`"><code :class="`language-${file.highlight}`" v-html="$options.filters.highlight(file.content, file.highlight)"></code></pre>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    name: {
      type: String,
      required: true,
    },
  },

  data() {
    return {
      content: null,
      files: [],
      syntax: {
        js: 'javascript',
        vue: 'markup',
        css: 'css',
      },
    }
  },

  computed: {
    mainFile() {
      const file = this.files.find(item => item.path.endsWith('.vue'))

      if (!file) {
        return
      }

      return require(`~/demos/${file.path}`).default
    },
  },

  mounted() {
    this.files = require.context(`~/demos/`, true)
      .keys()
      .filter(path => path.startsWith(`./${this.name}`))
      .filter(path => path.endsWith('.vue') || path.endsWith('.js') || path.endsWith('.css'))
      .map(path => path.replace('./', ''))
      .map(path => ({
        path,
        name: path.replace(`${this.name}/`, ''),
        content: require(`!!raw-loader!~/demos/${path}`).default,
        extension: path.split('.').pop(),
        highlight: this.syntax[path.split('.').pop()] || 'markup',
      }))
  }
}
</script>
