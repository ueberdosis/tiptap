<template>
  <div v-if="editor">
    <button @click="editor.chain().focus().setAttributes({ align: 'left' }).run()">
      left
    </button>
    <button @click="editor.chain().focus().setAttributes({ align: 'center' }).run()">
      center
    </button>
    <button @click="editor.chain().focus().setAttributes({ align: 'right' }).run()">
      right
    </button>
    <editor-content :editor="editor" />
  </div>
</template>

<script>
import { Editor } from '@tiptap/core'
import { EditorContent } from '@tiptap/vue'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import TextAlign from '@tiptap/extension-text-align'

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
        TextAlign(),
      ],
      content: `
        <p>first paragraph</p>
        <p>second paragraph</p>
      `,
    })
  },

  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>
