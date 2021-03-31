<template>
  <client-only>
    <demo-frame v-if="inline && mainFile" v-bind="props" />
    <div class="demo" v-else>
      <template v-if="mainFile">
        <demo-frame class="demo__preview" v-bind="props" />
        <div class="demo__source" v-if="showSource">
          <div class="demo__scroller" v-if="showFileNames">
            <div class="demo__tabs">
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
          </div>
          <div class="demo__code" v-if="activeFile" :key="activeFile.path">
            <!-- eslint-disable-next-line -->
            <prism :language="activeFile.highlight" :highlight="highlight">{{ activeFile.content }}</prism>
          </div>
        </div>
        <div class="demo__meta">
          <g-link class="demo__name" :to="`/demos/${name}`" v-if="isDevelopment">
            Demo/{{ name }}
          </g-link>
          <div class="demo__name" v-else>
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
  </client-only>
</template>

<script>
import Prism from '~/components/Prism'
import DemoFrame from '~/components/DemoFrame'
import DemoMixin from '~/components/DemoMixin'

export default {
  mixins: [DemoMixin],

  components: {
    DemoFrame,
    Prism,
  },

  data() {
    return {
      currentIndex: 0,
    }
  },

  computed: {
    showFileNames() {
      return this.files.length > 1
    },

    activeFile() {
      return this.files[this.currentIndex]
    },

    isDevelopment() {
      return process.env.NODE_ENV === 'development'
    },

    githubUrl() {
      if (this.isDevelopment) {
        return `vscode://file${this.cwd}/src/demos/${this.name}/${this.files[0].name}`
      }

      return `https://github.com/ueberdosis/tiptap-next/tree/main/docs/src/demos/${this.name}`
    },
  },
}
</script>

<style lang="scss" src="./style.scss" scoped />
