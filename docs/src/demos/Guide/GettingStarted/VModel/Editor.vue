<template>
  <editor-content :editor="editor" />
</template>

<script>
import { Editor } from '@tiptap/core'
import { EditorContent } from '@tiptap/vue'
import { defaultExtensions } from '@tiptap/starter-kit'

export default {
  components: {
    EditorContent,
  },

  props: {
    value: {
      type: String,
      default: '',
    },
  },

  data() {
    return {
      editor: null,
    }
  },

  watch: {
    value(value) {
      const isSame = this.editor.getHTML() === value

      if (isSame) {
        return
      }

      this.editor.commands.setContent(this.value, false)
    },
  },

  mounted() {
    this.editor = new Editor({
      extensions: defaultExtensions(),
      content: this.value,
    })

    this.editor.on('update', () => {
      this.$emit('input', this.editor.getHTML())
    })
  },

  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>
