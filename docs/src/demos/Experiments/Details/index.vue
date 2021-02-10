<template>
  <div v-if="editor">
    <editor-content :editor="editor" />
  </div>
</template>

<script>
import {
  Editor, EditorContent, defaultExtensions,
} from '@tiptap/vue-starter-kit'
import Details from './details'
import DetailsSummary from './details-summary'

export default {
  components: {
    EditorContent,
  },

  data() {
    return {
      editor: null,
    }
  },

  mounted() {
    this.editor = new Editor({
      extensions: [
        ...defaultExtensions(),
        Details,
        DetailsSummary,
      ],
      content: `
        <p>Here is a details list:</p>
        <details open>
          <summary>An open details tag</summary>
          <p>More info about the details.</p>
        </details>
        <details>
          <summary>A closed details tag</summary>
          <p>More info about the details.</p>
        </details>
      `,
    })
  },

  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>

<style lang="scss">
.ProseMirror {
  > * + * {
    margin-top: 0.75em;
  }
}
</style>
