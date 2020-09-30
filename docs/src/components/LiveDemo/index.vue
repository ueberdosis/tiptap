<template>
  <div class="live-demo">
    <template v-if="mainFile">
      <div class="live-demo__preview">
        <vue-live
          :code="mainFile.content"
          :layout="CustomLayout"
          :requires="requires"
          @error="(e) => handleError(e)"
        />
      </div>
      <div class="live-demo__source" v-if="showSource">
        <div class="live-demo__tabs" v-if="showFileNames">
          <button
            class="live-demo__tab"
            :class="{ 'is-active': currentIndex === index}"
            v-for="(file, index) in files"
            :key="index"
            @click="currentIndex = index"
          >
            {{ file.name }}
          </button>
        </div>
        <div class="live-demo__code" v-if="activeFile" :key="activeFile.path">
          <prism :code="activeFile.content" :language="activeFile.highlight" :highlight="highlight" />
        </div>
      </div>
      <div class="live-demo__meta">
        <div class="live-demo__name">
          Demo/{{ name }}
        </div>
        <a class="live-demo__link" :href="githubUrl" target="_blank">
          Edit on GitHub →
        </a>
      </div>
    </template>
    <div v-else class="live-demo__error">
      Could not find a demo called “{{ name }}”.
    </div>
  </div>
</template>

<script>
import collect from 'collect.js'
import { VueLive } from 'vue-live'
import * as starterKit from '@tiptap/vue-starter-kit'
import Prism from '~/components/Prism'
import CustomLayout from './CustomLayout'

export default {
  components: {
    Prism,
    VueLive,
  },

  props: {
    name: {
      type: String,
      required: true,
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
      CustomLayout,
      syntax: {
        vue: 'markup',
      },
      requires: {
        '@tiptap/vue-starter-kit': starterKit,
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

      return file

      // return require(`~/demos/${file.path}`).default
    },

    showFileNames() {
      return this.files.length > 1
    },

    activeFile() {
      return this.files[this.currentIndex]
    },

    githubUrl() {
      return `https://github.com/ueberdosis/tiptap-next/tree/main/docs/src/demos/${this.name}`
    },
  },

  mounted() {
    this.files = collect(require.context('~/demos/', true, /.+\..+$/).keys())
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
      .filter(item => {
        return ['vue', 'jsx', 'scss'].includes(item.extension)
      })
      .sortBy(item => item.path.split('/').length)
      .toArray()
  },
}
</script>

<style lang="scss" src="./style.scss" scoped />
