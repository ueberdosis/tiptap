<template>
  <div v-if="editor">
    <editor-content :editor="editor" />
  </div>
</template>

<script>
import { Editor, EditorContent } from '@tiptap/vue-2'
import { defaultExtensions } from '@tiptap/starter-kit'
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
        ...defaultExtensions(),
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
