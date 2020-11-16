<template>
  <div>
    <editor-content :editor="editor" />
  </div>
</template>

<script>
import { Editor, EditorContent } from '@tiptap/vue-starter-kit'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Dropcursor from '@tiptap/extension-dropcursor'
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
        Dropcursor,
      ],
      content: `
        <p>Try to drag around the image. While you drag, the editor should show a decoration under your cursor. The so called dropcursor.</p>
        <img src="https://source.unsplash.com/8xznAGy4HcY/800x400" />
      `,
    })
  },

  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>
