<template>
  <div v-if="editor">
    <button @click="editor.chain().focus().toggleSuperscript().run()" :class="{ 'is-active': editor.isActive('superscript') }">
      superscript
    </button>

    <editor-content :editor="editor" />
  </div>
</template>

<script>
import { Editor, EditorContent } from '@tiptap/vue-3'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Superscript from '@tiptap/extension-superscript'

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
        Superscript,
      ],
      content: `
        <p>This is regular text.</p>
        <p><sup>This is superscript.</sup></p>
        <p><span style="vertical-align: super">And this.</span></p>
      `,
    })
  },

  beforeUnmount() {
    this.editor.destroy()
  },
}
</script>
