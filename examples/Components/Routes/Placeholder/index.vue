<template>
  <div class="editor">
    <editor-content class="editor__content" :editor="editor" />
  </div>
</template>

<script>
import { Editor, EditorContent } from 'tiptap'
import {
  BulletList,
  ListItem,
  Placeholder,
} from 'tiptap-extensions'

export default {
  components: {
    EditorContent,
  },
  data() {
    return {
      editor: new Editor({
        extensions: [
          new BulletList(),
          new ListItem(),
          new Placeholder({
            emptyClass: 'is-empty',
            emptyNodeText: 'Write something …',
            showOnlyWhenEditable: true,
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
.editor p.is-empty:first-child::before {
  content: attr(data-empty-text);
  float: left;
  color: #aaa;
  pointer-events: none;
  height: 0;
  font-style: italic;
}
</style>
