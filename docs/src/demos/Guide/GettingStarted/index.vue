<template>
  <editor-content :editor="editor" />
</template>

<script>
// import { Editor, EditorContent, defaultExtensions } from '@tiptap/vue-starter-kit'
import { Editor, EditorContent } from '@tiptap/vue-starter-kit'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'

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
      content: '<p>I’m running tiptap with Vue.js. 🎉</p>',
      // extensions: defaultExtensions(),
      extensions: [
        new Document(),
        new Paragraph(),
        new Text(),
      ],
    })
  },

  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>
