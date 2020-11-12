<template>
  <div>
    <editor-content :editor="editor" />
  </div>
</template>

<script>
import { Editor } from '@tiptap/core'
import { defaultExtensions } from '@tiptap/starter-kit'
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
  },

  data() {
    return {
      editor: null,
    }
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
