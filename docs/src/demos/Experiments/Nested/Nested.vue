<template>
  <div class="editor-nested" v-if="editor">
    <editor-content :editor="editor" />
  </div>
</template>

<script>
import { Editor, EditorContent } from '@tiptap/vue-2'
import StarterKit from '@tiptap/starter-kit'
import CustomNode from './CustomNode.js'

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
      content: `
      Nested intro text`,
      extensions: [StarterKit, CustomNode],
    })
  },

  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>

<style>
.editor-nested {
  padding: 10px;
  border: 1px gray solid;
}
.ProseMirror {
  outline: none;
}
</style>
