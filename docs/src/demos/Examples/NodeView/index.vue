<template>
  <div v-if="editor">
    <editor-content :editor="editor" />
  </div>
</template>

<script>
import { Editor } from '@tiptap/core'
import { EditorContent } from '@tiptap/vue'
import Dropcursor from '@tiptap/extension-dropcursor'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Test from './Test.ts'

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
        Dropcursor,
        Document,
        Paragraph,
        Text,
        Test,
      ],
      content: `
        <p>test</p>
        <div data-type="test"></div>
        <p>test</p>
      `,
    })
  },

  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>

<style lang="scss">
ul[data-type="taskList"] {
  list-style: none;
  padding: 0;

  li {
    display: flex;
    align-items: center;

    > input {
      flex: 0 0 auto;
      margin-right: 0.5rem;
    }
  }
}
</style>
