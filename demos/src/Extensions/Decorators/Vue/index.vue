<template>
  <editor-content :editor="editor" />
</template>

<script>
import Decorations from '@tiptap/extension-decorations'
import Document from '@tiptap/extension-document'
import HardBreak from '@tiptap/extension-hard-break'
import Image from '@tiptap/extension-image'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
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
        Image,
        Decorations,
        HardBreak,
      ],
      content: `
        <p>This content should show decorations for invisible characters<br />This is default behaviour - you can override this by using Decorations.configure().</p>
        <p>Try editing the content to see different types of characters.</p>
      `,
    })
  },

  beforeUnmount() {
    this.editor.destroy()
  },
}
</script>

<style lang="scss">
/* Basic editor styles */
.ProseMirror {
  > * + * {
    margin-top: 0.75em;
  }

  img {
    max-width: 100%;
    height: auto;
  }

  .prosemirror--decorator {
    position: relative;
    padding: 0 2px;
  }

  .prosemirror--decorator:before {
    content: '';
    color: #aaa;
    position: absolute;
  }

  .prosemirror--decorator.type-space:before {
    content: '·'
  }

  .prosemirror--decorator.type-break:before {
    content: '¬'
  }

  .prosemirror--decorator.type-paragraph:before {
    content: '¶'
  }
}
</style>
