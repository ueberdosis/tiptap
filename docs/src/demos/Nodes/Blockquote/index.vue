<template>
  <div v-if="editor">
    <button @click="editor.chain().focus().toggleBlockquote().run()" :class="{ 'is-active': editor.isActive('blockquote') }">
      blockquote
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
import Blockquote from '@tiptap/extension-blockquote'

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
        Blockquote,
      ],
      content: `
          <blockquote>
            Life is like riding a bycicle. To keep your balance, you must keep moving.
          </blockquote>
          <p>Albert Einstein</p>
        `,
    })
  },

  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>
