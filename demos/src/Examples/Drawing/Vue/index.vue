<template>
  <editor-content :editor="editor" />
</template>

<script>
import { Document } from '@tiptap/editor/extensions/document'
import { Text } from '@tiptap/editor/extensions/text'
import { Editor, EditorContent } from '@tiptap/vue'

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
