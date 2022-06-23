<template>
  <editor-content :editor="editor" />
</template>

<script>
import Document from '@tiptap/extension-document'
import Image from '@tiptap/extension-image'
import Invisibles from '@tiptap/extension-invisibles'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { Editor, EditorContent } from '@tiptap/vue-3'

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
        Document,
        Paragraph,
        Text,
        Image,
        Invisibles,
      ],
      content: `
        <p>This content should show invisible characters.</p>
        <p>Try editing the content to see different types of characters.</p>
      `,
    })
  },

  beforeUnmount() {
    this.editor.destroy()
  },
}
</script>

<style lang="scss">
/* Basic editor styles */
.ProseMirror {
  > * + * {
    margin-top: 0.75em;
  }

  img {
    max-width: 100%;
    height: auto;
  }
}
</style>
