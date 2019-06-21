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
        autoFocus: true,
        extensions: [
          new Doc(),
          new Title(),
          new Placeholder({
            showOnlyCurrent: false,
            emptyNodeText: node => {
              if (node.type.name === 'title') {
                return 'Give me a name'
              }

              return 'Write something'
            },
          }),
        ],
      }),
    }
  },
  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>

<style lang="scss">
.editor *.is-empty:nth-child(1)::before,
.editor *.is-empty:nth-child(2)::before {
  content: attr(data-empty-text);
  float: left;
  color: #aaa;
  pointer-events: none;
  height: 0;
  font-style: italic;
}
</style>
