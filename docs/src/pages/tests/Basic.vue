<template>
  <Layout>
    <editor-content :editor="editor" />
  </Layout>
</template>

<script>
import { Editor } from '@tiptap/core'
import { EditorContent } from '@tiptap/vue'
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