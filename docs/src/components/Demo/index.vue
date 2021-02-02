<template>
  <demo-frame v-if="inline && mainFile" v-bind="props" />
  <div class="demo" v-else>
    <template v-if="mainFile">
      <demo-frame class="demo__preview" v-bind="props" />
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
    <template v-else>
      <div v-if="mainFile === false" class="demo__error">
        Could not find a demo called “{{ name }}”.
      </div>
      <div v-else class="demo__skeleton" />
    </template>
  </div>
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

    githubUrl() {
      if (process.env.NODE_ENV === 'development') {
        return `vscode://file${this.cwd}/src/demos/${this.name}/${this.files[0].name}`
      }

      return `https://github.com/ueberdosis/tiptap-next/tree/main/docs/src/demos/${this.name}`
    },
  },
}
</script>

<style lang="scss" src="./style.scss" scoped />
