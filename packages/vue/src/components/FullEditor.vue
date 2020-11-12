<template>
  <div>
    <editor-content :editor="editor" />
  </div>
</template>

<script>
import { Editor } from '@tiptap/core'
import EditorContent from './EditorContent.ts'

export default {
  components: {
    EditorContent,
  },

  props: {
    value: {
      type: [String, Object],
      default: '',
    },

    extensions: {
      type: Array,
      required: true,
      default: () => [],
    },
  },

  data() {
    return {
      editor: null,
    }
  },

  mounted() {
    this.editor = new Editor({
      extensions: this.extensions,
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
