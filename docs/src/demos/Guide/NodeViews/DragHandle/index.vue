<template>
  <div v-if="editor">
    <editor-content :editor="editor" />
  </div>
</template>

<script>
import { Editor, EditorContent } from '@tiptap/vue-2'
import StarterKit from '@tiptap/starter-kit'
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
        StarterKit,
        DraggableItem,
      ],
      content: `
        <p>This is a boring paragraph.</p>
        <div data-type="draggable-item">
          <p>Followed by a fancy draggable item.</p>
        </div>
        <div data-type="draggable-item">
          <p>And another draggable item.</p>
          <div data-type="draggable-item">
            <p>And a nested one.</p>
            <div data-type="draggable-item">
              <p>But can we go deeper?</p>
            </div>
          </div>
        </div>
        <p>Let’s finish with a boring paragraph.</p>
      `,
    })
  },

  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>
