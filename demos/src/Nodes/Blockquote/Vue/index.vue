<template>
  <div v-if="editor" class="container">
    <div class="control-group">
      <div class="button-group">
        <button @click="editor.chain().focus().toggleBlockquote().run()" :class="{ 'is-active': editor.isActive('blockquote') }">
          Toggle blockquote
        </button>
        <button @click="editor.chain().focus().setBlockquote().run()" :disabled="!editor.can().setBlockquote()">
          Set blockquote
        </button>
        <button @click="editor.chain().focus().unsetBlockquote().run()" :disabled="!editor.can().unsetBlockquote()">
          Unset blockquote
        </button>
      </div>
    </div>
    <editor-content :editor="editor" />
  </div>
</template>

<script>
import Blockquote from '@tiptap/extension-blockquote'
import Document from '@tiptap/extension-document'
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
.tiptap {
  :first-child {
    margin-top: 0;
  }

  blockquote {
    border-left: 3px solid var(--gray-3);
    margin: 1.5rem 0;
    padding-left: 1rem;
  }
}
</style>
