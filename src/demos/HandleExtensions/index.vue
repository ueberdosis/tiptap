<template>
  <div>
    <div v-if="editor">
      <button @click="editor.undo().focus()">
        undo
      </button>
      <button @click="editor.redo().focus()">
        redo
      </button>
    </div>
    <div ref="editor"></div>
  </div>
</template>

<script>
import Editor from '@tiptap/core'
import Document from '@tiptap/document-extension'
import Paragraph from '@tiptap/paragraph-extension'
import Text from '@tiptap/text-extension'
import History from '@tiptap/history-extension'

export default {
  data() {
    return {
      editor: null,
    }
  },

  mounted() {
    this.editor = new Editor({
      element: this.$refs.editor,
      content: '<p>foo</p>',
      extensions: [
        new Document(),
        new Paragraph(),
        new Text(),
        new History(),
      ],
    })
  },

  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>