<template>
  <div v-if="editor">
    <button @click="editor.focus().codeBlock()" :class="{ 'is-active': editor.isActive('codeBlock') }">
      code block
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
import CodeBlock from '@tiptap/extension-code-block'

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
        CodeBlock(),
      ],
      content: `
        <p>This is a code block:</p>
        <pre><code>const foo = 'bar'</code></pre>
      `,
    })

    window.editor = this.editor
  },

  beforeDestroy() {
    this.editor.destroy()
  }
}
</script>