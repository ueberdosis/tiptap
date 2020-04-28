<template>
  <div class="demo">
    <div class="demo__preview" v-if="mainFile">
      <component :is="mainFile" v-if="mode === 'vue'" />
      <react-renderer :component="mainFile" v-if="mode === 'react'" />
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
import collect from 'collect.js'
import ReactRenderer from '~/components/ReactRenderer'

export default {
  components: {
    ReactRenderer,
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
      files: [],
      content: null,
      currentIndex: 0,
      syntax: {
        vue: 'markup',
      },
    }
  },

  computed: {
    mainFile() {
      const file = this.files
        .find(item => item.path.endsWith('.vue') || item.path.endsWith('.jsx'))

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
    this.files = collect(require.context(`~/demos/`, true, /.+\..+$/).keys())
      .filter(path => path.startsWith(`./${this.name}`))
      .map(path => path.replace('./', ''))
      .map(path => {
        const extension = path.split('.').pop()

        return {
          path,
          name: path.replace(`${this.name}/`, ''),
          content: require(`!!raw-loader!~/demos/${path}`).default,
          extension,
          highlight: this.syntax[extension] || extension,
        }
      })
      .sortBy(item => item.path.split('/').length)
      .toArray()
  }
}
</script>

<style lang="scss" src="./style.scss" scoped />