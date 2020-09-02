<template>
  <div v-if="editor">
    <button @click="editor.focus().undo()">
      undo
    </button>
    <button @click="editor.focus().redo()">
      redo
    </button>

    <editor-content :editor="editor" />
  </div>
</template>

<script>
import { Editor } from '@tiptap/core'
import { EditorContent } from '@tiptap/vue'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import History from '@tiptap/extension-history'

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
        new Document(),
        new Paragraph(),
        new Text(),
        new History(),
      ],
      content: `
        <p>Edit this text and press undo to test this extension.</p>
      `,
    })

    window.editor = this.editor
  },

  beforeDestroy() {
    this.editor.destroy()
  }
}
</script>