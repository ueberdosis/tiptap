<template>
  <div v-if="editor">
    <button @click="editor.chain().focus().textAlign('left').run()">
      left
    </button>
    <button @click="editor.chain().focus().textAlign('center').run()">
      center
    </button>
    <button @click="editor.chain().focus().textAlign('right').run()">
      right
    </button>
    <button @click="editor.chain().focus().setDefaultNodeAttributes(['textAlign']).run()">
      set default
    </button>
    <editor-content :editor="editor" />
  </div>
</template>

<script>
import { Editor } from '@tiptap/core'
import { EditorContent } from '@tiptap/vue'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Heading from '@tiptap/extension-heading'
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
        Heading(),
        TextAlign(),
      ],
      content: `
        <h2>Heading</h2>
        <p style="text-align: center">first paragraph</p>
        <p style="text-align: right">second paragraph</p>
      `,
    })
  },

  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>
