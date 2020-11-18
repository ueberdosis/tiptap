<template>
  <div v-if="editor">
    <button @click="editor.chain().focus().setTextAlign('left').run()">
      left
    </button>
    <button @click="editor.chain().focus().setTextAlign('center').run()">
      center
    </button>
    <button @click="editor.chain().focus().setTextAlign('right').run()">
      right
    </button>
    <button @click="editor.chain().focus().setTextAlign('justify').run()">
      justify
    </button>
    <button @click="editor.chain().focus().unsetTextAlign().run()">
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
        Document,
        Paragraph,
        Text,
        Heading,
        TextAlign,
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
