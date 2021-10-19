<template>
  <div v-if="editor">
    <button @click="editor.chain().focus().setHorizontalRule().run()">
      setHorizontalRule
    </button>

    <editor-content :editor="editor" />
  </div>
</template>

<script>
import { Editor, EditorContent } from '@tiptap/vue-3'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import HorizontalRule from '@tiptap/extension-horizontal-rule'

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
        HorizontalRule,
      ],
      content: `
        <p>This is a paragraph.</p>
        <hr>
        <p>And this is another paragraph.</p>
        <hr>
        <p>But between those paragraphs are horizontal rules.</p>
      `,
    })
  },

  beforeUnmount() {
    this.editor.destroy()
  },
}
</script>

<style lang="scss">
hr.ProseMirror-selectednode {
  border-top: 1px solid #68CEF8;
}
</style>
