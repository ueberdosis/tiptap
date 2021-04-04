<template>
  <node-view-wrapper class="code-block">
    <select contenteditable="false" class="code-block-select" v-model="selectedLanguage">
      <option v-for="(language, index) in languages" :value="language" :key="index">
        {{ language }}
      </option>
      <option :value="null">
        auto
      </option>
    </select>
    <pre><node-view-content as="code" /></pre>
  </node-view-wrapper>
</template>

<script>
import { NodeViewWrapper, NodeViewContent, nodeViewProps } from '@tiptap/vue-2'

export default {
  components: {
    NodeViewWrapper,
    NodeViewContent,
  },

  props: nodeViewProps,

  computed: {
    selectedLanguage: {
      get() {
        return this.node.attrs.language
      },
      set(language) {
        this.updateAttributes({ language })
      }
    }
  },

  data() {
    return {
      languages: ['js', 'css'],
    }
  },
}
</script>

<style>
.code-block {
  position: relative;
}

.code-block-select {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
}
</style>
