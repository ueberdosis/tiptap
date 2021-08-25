<template>
  <div v-if="editor">
    <button @click="editor.chain().focus().toggleCode().run()" :class="{ 'is-active': editor.isActive('code') }">
      code
    </button>

    <editor-content :editor="editor" />
  </div>
</template>

<script>
import { Editor, EditorContent } from '@tiptap/vue-3'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Code from '@tiptap/extension-code'

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
        Code,
      ],
      content: `
        <p>This isn’t code.</p>
        <p><code>This is code.</code></p>
      `,
    })
  },

  beforeUnmount() {
    this.editor.destroy()
  },
}
</script>
