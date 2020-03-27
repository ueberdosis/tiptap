<template>
  <editor-content :editor="editor" />
</template>

<script>
import { Editor } from '@tiptap/core'
import { EditorContent } from '@tiptap/vue'
import extensions from '@tiptap/starter-kit'

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
      content: '<p>foo</p>',
      extensions: extensions(),
    })
  },

  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>