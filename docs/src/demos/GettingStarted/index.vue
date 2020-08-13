<template>
  <editor-content :editor="editor" />
</template>

<script>
import { Editor, EditorContent, defaultExtensions } from '@tiptap/vue'

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
      content: '<p>I’m running tiptap with Vue.js. 🎉</p>',
      extensions: defaultExtensions(),
    })
  },

  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>