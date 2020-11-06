<template>
  <div v-if="editor">
    <button @click="editor.chain().focus().fontFamily('Inter').run()">
      Inter
    </button>
    <button @click="editor.chain().focus().fontFamily('Comic Sans MS, Comic Sans').run()">
      Comic Sans
    </button>
    <button @click="editor.chain().focus().fontFamily('serif').run()">
      serif
    </button>
    <button @click="editor.chain().focus().fontFamily('monospace').run()">
      monospace
    </button>
    <button @click="editor.chain().focus().fontFamily('cursive').run()">
      cursive
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
import Heading from '@tiptap/extension-heading'
import TextStyle from '@tiptap/extension-text-style'
import FontFamily from '@tiptap/extension-font-family'

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
        TextStyle(),
        FontFamily(),
      ],
      content: `
        <h2>Hello</h2>
        <p>This is text.</p>
      `,
    })
  },

  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>
