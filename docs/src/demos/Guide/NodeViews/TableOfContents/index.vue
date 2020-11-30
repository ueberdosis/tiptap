<template>
  <div v-if="editor">
    <editor-content :editor="editor" />
  </div>
</template>

<script>
import { Editor, EditorContent, defaultExtensions } from '@tiptap/vue-starter-kit'
import TableOfContents from './TableOfContents.js'

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
        TableOfContents,
      ],
      content: `
        <toc></toc>
        <h2>heading</h2>
        <p>paragraph</p>
        <h3>heading</h3>
        <p>paragraph</p>
        <h3>heading</h3>
        <p>paragraph</p>
        <h2>heading</h2>
        <p>paragraph</p>
        <h3>heading</h3>
        <p>paragraph</p>
      `,
    })
  },

  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>
