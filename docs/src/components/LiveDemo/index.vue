<template>
  <div class="live-demo">
    <template v-if="file">
      <div class="live-demo__preview">
        <vue-live
          :code="file.content"
          :layout="CustomLayout"
          :requires="requires"
        />
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
import CustomLayout from './CustomLayout'

export default {
  components: {
    VueLive,
  },

  props: {
    name: {
      type: String,
      required: true,
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
    file() {
      return this.files[0]
    },

    githubUrl() {
      return `https://github.com/ueberdosis/tiptap-next/tree/main/docs/src/demos/${this.name}`
    },
  },

  mounted() {
    this.files = collect(require.context('~/demos/', true, /.+\..+$/).keys())
      .filter(path => path.startsWith(`./${this.name}/index.vue`))
      .map(path => path.replace('./', ''))
      .map(path => {
        return {
          path,
          name: path.replace(`${this.name}/`, ''),
          content: require(`!!raw-loader!~/demos/${path}`).default,
        }
      })
      .toArray()
  },
}
</script>

<style lang="scss" src="./style.scss" scoped />
