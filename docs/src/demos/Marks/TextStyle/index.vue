<template>
  <div v-if="editor">
    <button
      @click="editor.chain().focus().fontFamily('Comic Sans MS').run()"
      :class="{ 'is-active': editor.isActive('textStyle', { fontFamily: 'Comic Sans MS' }) }"
    >
      Comic Sans
    </button>
    <button @click="editor.chain().focus().fontFamily().run()">
      Remove font-family
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
        TextStyle(),
        FontFamily(),
      ],
      content: `
        <p><span style="font-family: Comic Sans MS">Welcome to the internet.</span></p>
      `,
    })
  },

  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>
