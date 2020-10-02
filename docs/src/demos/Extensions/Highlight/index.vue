<template>
  <div v-if="editor">
    <button @click="editor.chain().focus().highlight().run()" :class="{ 'is-active': editor.isActive('highlight') }">
      highlight
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
import Highlight from '@tiptap/extension-highlight'

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
        Highlight(),
      ],
      content: `
          <p>This isn’t highlighted.</s></p>
          <p><mark>But this one is.</mark></p>
        `,
    })
  },

  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>
