<template>
  <div class="editor">
    <editor-content class="editor__content" :editor="editor" />
  </div>
</template>

<script>
import Icon from 'Components/Icon'
import { Editor, EditorContent } from 'tiptap'
import { Heading, Code } from 'tiptap-extensions'
import DragItem from './DragItem'

export default {
  components: {
    EditorContent,
    Icon,
  },
  data() {
    return {
      editor: new Editor({
        extensions: [
          new Heading(),
          new Code(),
          new DragItem(),
        ],
        content: `
          <h2>
            Drag Handle
          </h2>
          <p>
            Add <code>data-drag-handle</code> to a DOM element within your node view to define your custom drag handle.
          </p>
          <div data-type="drag_item">
            Drag me!
          </div>
          <div data-type="drag_item">
            Try it!
          </div>
          <div data-type="drag_item">
            It works!
          </div>
        `,
      }),
    }
  },
  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>

<style lang="scss">
[data-type="drag_item"] {
  display: flex;
  padding: 0.5rem;
  background-color: rgba(black, 0.05);
  margin-bottom: 0.5rem;
  border-radius: 6px;

  > :first-child {
    flex: 1 1 auto;
  }

  > :last-child {
    flex: 0 0 auto;
    margin-left: auto;
    cursor: move;
  }
}
</style>
