<template>
  <editor-content :editor="editor" />
</template>

<script>
import StarterKit from '@tiptap/starter-kit'
import { Editor, EditorContent } from '@tiptap/vue-3'

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
      content: '<p>Hello World! 🌎️</p>',
      extensions: [
        StarterKit,
      ],
    })
  },

  beforeUnmount() {
    this.editor.destroy()
  },
}
</script>
