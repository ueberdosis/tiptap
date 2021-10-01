<template>
  <div v-if="editor">
    <button @click="editor.chain().focus().toggleBlockquote().run()" :class="{ 'is-active': editor.isActive('blockquote') }">
      toggleBlockquote
    </button>
    <button @click="editor.chain().focus().setBlockquote().run()" :disabled="!editor.can().setBlockquote()">
      setBlockquote
    </button>
    <button @click="editor.chain().focus().unsetBlockquote().run()" :disabled="!editor.can().unsetBlockquote()">
      unsetBlockquote
    </button>

    <editor-content :editor="editor" />
  </div>
</template>

<script>
import { Editor, EditorContent } from '@tiptap/vue-3'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Blockquote from '@tiptap/extension-blockquote'

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
        Blockquote,
      ],
      content: `
          <blockquote>
            Nothing is impossible, the word itself says “I’m possible!”
          </blockquote>
          <p>Audrey Hepburn</p>
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

  blockquote {
    padding-left: 1rem;
    border-left: 3px solid rgba(#0D0D0D, 0.1);
  }
}
</style>
