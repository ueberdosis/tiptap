<template>
  <editor-content :editor="editor" />
</template>

<script>
import { Editor, EditorContent } from '@tiptap/vue-2'
import { defaultExtensions } from '@tiptap/starter-kit'

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
      extensions: defaultExtensions(),
    })
  },

  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>
