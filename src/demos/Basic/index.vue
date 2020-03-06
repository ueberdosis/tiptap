<template>
  <div ref="editor"></div>
</template>

<script>
import Editor from '@tiptap/core'
import extensions from '@tiptap/starter-kit'

export default {
  data() {
    return {
      editor: null,
    }
  },

  mounted() {
    this.editor = new Editor({
      element: this.$refs.editor,
      content: '<p>foo</p>',
      extensions: extensions(),
    })
  },

  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>