<template>
  <div v-if="editor">
    <editor-content :editor="editor" />
  </div>
</template>

<script>
import { Editor } from '@tiptap/core'
import { EditorContent } from '@tiptap/vue'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
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
        Document(),
        Paragraph(),
        Text(),
        Image(),
      ],
      content: `
        <p>This is basic example of implementing images. Try to drop new images here. Reordering also works.</p>
        <img src="https://source.unsplash.com/8xznAGy4HcY/800x600" />
      `,
    })
  },

  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>
