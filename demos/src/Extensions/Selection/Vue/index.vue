<template>
  <editor-content :editor="editor" />
</template>

<script>
import Code from '@dibdab/extension-code'
import Document from '@dibdab/extension-document'
import { BulletList, ListItem } from '@dibdab/extension-list'
import Paragraph from '@dibdab/extension-paragraph'
import Text from '@dibdab/extension-text'
import { Selection } from '@dibdab/extensions'
import { Editor, EditorContent } from '@dibdab/vue-3'

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
        Selection.configure({
          className: 'selection',
        }),
        Code,
        BulletList,
        ListItem,
      ],
      content: `
        <p>
          The selection extension adds a class to the selection when the editor is blurred. That enables you to visually preserve the selection even though the editor is blurred. By default, it’ll add <code>.selection</code> classname.
        </p>
      `,
      onCreate: ({ editor }) => {
        editor.commands.setTextSelection({ from: 5, to: 30 })
      },
    })
  },

  beforeUnmount() {
    this.editor.destroy()
  },
}
</script>

<style lang="scss">
/* Basic editor styles */
.tiptap {
  :first-child {
    margin-top: 0;
  }

  /* List styles */
  ul,
  ol {
    padding: 0 1rem;
    margin: 1.25rem 1rem 1.25rem 0.4rem;

    li p {
      margin-top: 0.25em;
      margin-bottom: 0.25em;
    }
  }

  /* Code and preformatted text styles */
  code {
    background-color: var(--purple-light);
    border-radius: 0.4rem;
    color: var(--black);
    font-size: 0.85rem;
    padding: 0.25em 0.3em;
  }

  // Selection styles
  .selection {
    box-shadow: 0 0 0 2px var(--purple);
  }
}
</style>
