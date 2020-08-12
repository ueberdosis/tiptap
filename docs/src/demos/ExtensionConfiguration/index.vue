<template>
  <div class="editor">
    <editor-content :editor="editor" />
  </div>
</template>

<script>
import { Editor } from '@tiptap/core'
import { EditorContent, Renderer } from '@tiptap/vue'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Bold from '@tiptap/extension-bold'

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
      content: '<p>I’m running tiptap with Vue.js. This demo is interactive, try to edit the text.</p>',
      extensions: [
        new Document(),
        new Paragraph(),
        new Text(),
        new Bold(),
      ],
      renderer: Renderer,
    })
  },

  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>