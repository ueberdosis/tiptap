<template>
  <div v-if="editor">
    <editor-content :editor="editor" />
  </div>
</template>

<script>
import { Editor, EditorContent } from '@tiptap/vue-2'
import { defaultExtensions } from '@tiptap/starter-kit'
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
        <h2>1 heading</h2>
        <p>paragraph</p>
        <h3>1.1 heading</h3>
        <p>paragraph</p>
        <h3>1.2 heading</h3>
        <p>paragraph</p>
        <h2>2 heading</h2>
        <p>paragraph</p>
        <h3>2.1 heading</h3>
        <p>paragraph</p>
      `,
    })
  },

  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>
