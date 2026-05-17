<template>
  <editor-content :editor="editor" />
</template>

<script>
import Document from '@tiptap/editor/nodes/document'
import Text from '@tiptap/editor/nodes/text'
import { Editor, EditorContent } from '@tiptap/vue-3'

import Paper from './Paper.js'

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
        Document.extend({
          content: 'paper',
        }),
        Text,
        Paper,
      ],
    })
  },

  beforeUnmount() {
    this.editor.destroy()
  },
}
</script>
