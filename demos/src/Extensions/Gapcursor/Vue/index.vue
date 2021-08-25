<template>
  <div>
    <editor-content :editor="editor" />
  </div>
</template>

<script>
import { Editor, EditorContent } from '@tiptap/vue-3'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Gapcursor from '@tiptap/extension-gapcursor'
import Image from '@tiptap/extension-image'

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
        Gapcursor,
      ],
      content: `
        <p>Try to move the cursor after the image with your arrow keys! You should see a horizontal blinking cursor below the image. This is the gapcursor.</p>
        <img src="https://source.unsplash.com/8xznAGy4HcY/800x400" />
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
