<template>
  <div v-if="editor">
    <editor-content :editor="editor" />
  </div>
</template>

<script>
import { Editor } from '@tiptap/core'
import { EditorContent } from '@tiptap/vue'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Dropcursor from '@tiptap/extension-dropcursor'
import DraggableItem from './DraggableItem.js'

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
      extensions: [
        Document,
        Paragraph,
        Text,
        Dropcursor,
        DraggableItem,
      ],
      content: `
        <p>paragraph</p>
        <div data-type="draggable-item">
          <p>draggable item</p>
        </div>
        <div data-type="draggable-item">
          <p>another one</p>
          <div data-type="draggable-item">
            <p>can be nested too</p>
            <div data-type="draggable-item">
              <p>but can we go deeper?</p>
            </div>
          </div>
        </div>
        <p>paragraph</p>
      `,
    })
  },

  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>
