<template>
  <Layout>
    <editor-content :editor="editor" />
  </Layout>
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
      element: this.$refs.editor,
      content: '<p>foo</p>',
      extensions: [
        new Document(),
        new Paragraph(),
        new Text(),
        new History(),
      ],
    })

    window.editor = this.editor
  },

  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>