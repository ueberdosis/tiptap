<template>
  <editor-content :editor="editor" />
</template>

<script>
import { Editor, EditorContent, defaultExtensions } from '@tiptap/vue-starter-kit'

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
      extensions: defaultExtensions(),
    })

    window.editor = this.editor
  },

  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>