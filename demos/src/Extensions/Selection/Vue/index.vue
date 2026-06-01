<template>
  <editor-content :editor="editor" />
</template>

<script>
import Code from '@tiptap/extension-code'
import Document from '@tiptap/extension-document'
import { BulletList, ListItem } from '@tiptap/extension-list'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { Selection } from '@tiptap/extensions'
import { Editor, EditorContent } from '@tiptap/vue-3'

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
          The Selection extension adds a class to the current text selection when the editor is blurred, which lets you keep the selected text highlighted even after the editor loses focus. This is especially useful when a selection spans multiple wrapped lines, where only the selected text should be highlighted rather than the empty space at the end of each line. By default it adds a <code>.selection</code> classname that you can style.
        </p>
      `,
      onCreate: ({ editor }) => {
        editor.commands.setTextSelection({ from: 5, to: 280 })
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
