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
    <editor-content :editor="editor" />
  </div>
</template>

<script>
import { Editor, EditorContent } from '@tiptap/core'
import Document from '@tiptap/document-extension'
import Paragraph from '@tiptap/paragraph-extension'
import Text from '@tiptap/text-extension'
import History from '@tiptap/history-extension'

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