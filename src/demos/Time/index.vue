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
      content: '<p>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.</p>',
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