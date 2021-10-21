<template>
  <div v-if="editor">
    <button @click="editor.chain().focus().toggleSubscript().run()" :class="{ 'is-active': editor.isActive('subscript') }">
      toggleSubscript
    </button>
    <button @click="editor.chain().focus().setSubscript().run()" :disabled="editor.isActive('subscript')">
      setSubscript
    </button>
    <button @click="editor.chain().focus().unsetSubscript().run()" :disabled="!editor.isActive('subscript')">
      unsetSubscript
    </button>

    <editor-content :editor="editor" />
  </div>
</template>

<script>
import { Editor, EditorContent } from '@tiptap/vue-3'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Subscript from '@tiptap/extension-subscript'

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
        Subscript,
      ],
      content: `
        <p>This is regular text.</p>
        <p><sub>This is subscript.</sub></p>
        <p><span style="vertical-align: sub">And this.</span></p>
      `,
    })
  },

  beforeUnmount() {
    this.editor.destroy()
  },
}
</script>
