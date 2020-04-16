<template>
  <div class="demo">
    <div class="demo__preview" v-if="mainFile">
      <component :is="mainFile" v-if="mode === 'vue'"/>
      <react-wrapper :component="mainFile" v-if="mode === 'react'" />
    </div>
    <div class="demo__source">
      <div class="demo__tabs" v-if="showFileNames">
        <button
          class="demo__tab"
          :class="{ 'is-active': currentIndex === index}"
          v-for="(file, index) in files"
          :key="index"
          @click="currentIndex = index"
        >
          {{ file.name }}
        </button>
      </div>
      <div class="demo__code" v-if="activeFile">
        <pre :class="`language-${activeFile.highlight}`"><code :class="`language-${activeFile.highlight}`" v-html="$options.filters.highlight(activeFile.content, activeFile.highlight)"></code></pre>
      </div>
    </div>
  </div>
</template>

<script>
import ReactWrapper from '~/components/ReactWrapper'

export default {
  components: {
    ReactWrapper,
  },
  props: {
    name: {
      type: String,
      required: true,
    },

    mode: {
      type: String,
      default: 'vue',
    },
  },

  data() {
    return {
      content: null,
      files: [],
      currentIndex: 0,
      syntax: {
        js: 'javascript',
        jsx: 'jsx',
        vue: 'markup',
        css: 'css',
      },
    }
  },

  computed: {
    mainFile() {
      const file = this.files.find(item => item.path.endsWith('.vue') || item.path.endsWith('.jsx'))

      if (!file) {
        return
      }

      return require(`~/demos/${file.path}`).default
    },

    showFileNames() {
      return this.files.length > 1
    },

    activeFile() {
      return this.files[this.currentIndex]
    },
  },

  mounted() {
    this.files = require.context(`~/demos/`, true)
      .keys()
      .filter(path => path.startsWith(`./${this.name}`))
      .filter(path => path.endsWith('.vue') || path.endsWith('.js') || path.endsWith('.css') || path.endsWith('.jsx'))
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

<style lang="scss" src="./style.scss" scoped />