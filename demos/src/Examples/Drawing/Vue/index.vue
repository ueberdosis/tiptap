<template>
  <editor-content :editor="editor" />
</template>

<script>
import { Editor, EditorContent } from '@tiptap/vue-3'
import Document from '@tiptap/extension-document'
import Text from '@tiptap/extension-text'
import Paper from './Paper'

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
