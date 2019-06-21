<template>
  <div class="editor">
    <editor-content class="editor__content" :editor="editor" />
  </div>
</template>

<script>
import { Editor, EditorContent } from 'tiptap'
import { Placeholder } from 'tiptap-extensions'
import Doc from './Doc'
import Title from './Title'

export default {
  components: {
    EditorContent,
  },
  data() {
    return {
      editor: new Editor({
        extensions: [
          new Doc(),
          new Title(),
          new Placeholder({
            emptyNodeClass: 'is-empty',
            emptyNodeText: 'Write something …',
          }),
        ],
        content: `
          <h1>This is a fixed title.</h1>
          <p>With ProseMirror you can force a document layout. Try to remove it. It's not possible.</p>
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
.editor p.is-empty:first-child::before {
  content: attr(data-empty-text);
  float: left;
  color: #aaa;
  pointer-events: none;
  height: 0;
  font-style: italic;
}
</style>
