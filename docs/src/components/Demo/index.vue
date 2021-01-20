<template>
  <div v-if="inline && mainFile">
    <component :is="mainFile" v-if="mode === 'vue'" />
    <react-renderer :component="mainFile" v-if="mode === 'react'" />
  </div>
  <div class="demo" v-else>
    {{ mainFile }}
    <template v-if="mainFile">
      <div class="demo__preview">
        <component :is="mainFile" v-if="mode === 'vue'" />
        <react-renderer :component="mainFile" v-if="mode === 'react'" />
      </div>
      <div class="demo__source" v-if="showSource">
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
        <div class="demo__code" v-if="activeFile" :key="activeFile.path">
          <prism :code="activeFile.content" :language="activeFile.highlight" :highlight="highlight" />
        </div>
      </div>
      <div class="demo__meta">
        <div class="demo__name">
          Demo/{{ name }}
        </div>
        <a class="demo__link" :href="githubUrl" target="_blank">
          Edit on GitHub →
        </a>
      </div>
    </template>
    <div v-else class="demo__error">
      Could not find a demo called “{{ name }}”.
    </div>
  </div>
</template>

<script>
import collect from 'collect.js'
import Prism from '~/components/Prism'

export default {
  components: {
    ReactRenderer: () => import(/* webpackChunkName: "react-renderer" */ '~/components/ReactRenderer'),
    Prism,
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

    inline: {
      type: Boolean,
      default: false,
    },

    highlight: {
      type: String,
      default: null,
    },

    showSource: {
      type: Boolean,
      default: true,
    },
  },

  data() {
    return {
      files: [],
      content: null,
      currentIndex: 0,
      syntax: {
        vue: 'html',
      },
    }
  },

  computed: {
    mainFile() {
      const file = this.files
        .find(item => item.path.endsWith('index.vue') || item.path.endsWith('.jsx'))

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

    githubUrl() {
      if (process.env.NODE_ENV === 'development') {
        return `vscode://file${this.cwd}/src/demos/${this.name}/${this.files[0].name}`
      }

      return `https://github.com/ueberdosis/tiptap-next/tree/main/docs/src/demos/${this.name}`
    },
  },

  mounted() {
    this.files = collect(require.context('~/demos/', true, /.+\..+$/).keys())
      .filter(path => path.startsWith(`./${this.name}/`))
      .filter(path => !path.endsWith('.spec.js') && !path.endsWith('.spec.ts'))
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
      .filter(item => {
        return ['vue', 'ts', 'js', 'jsx', 'scss'].includes(item.extension)
      })
      .sortBy(item => item.path.split('/').length && !item.path.endsWith('index.vue'))
      .toArray()
  },
}
</script>

<style lang="scss" src="./style.scss" scoped />
