<template>
  <div v-if="editor">
    <button @click="addImage">
      image
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

  methods: {
    addImage() {
      const url = window.prompt('URL')

      this.editor.chain().focus().image({ src: url }).run()
    },
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
        <p>This is a basic example of implementing images. Drag to re-order.</p>
        <img src="https://source.unsplash.com/8xznAGy4HcY/800x600" />
        <img src="https://source.unsplash.com/K9QHL52rE2k/800x600" />
      `,
    })
  },

  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>
