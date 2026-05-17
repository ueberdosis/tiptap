<template>
  <div v-if="editor" class="container">
    <div class="control-group">
      <div class="button-group">
        <button
          @click="editor.chain().focus().toggleItalic().run()"
          :class="{ 'is-active': editor.isActive('italic') }"
        >
          Toggle italic
        </button>
        <button @click="editor.chain().focus().setItalic().run()" :disabled="editor.isActive('italic')">
          Set italic
        </button>
        <button @click="editor.chain().focus().unsetItalic().run()" :disabled="!editor.isActive('italic')">
          Unset italic
        </button>
      </div>
    </div>
    <editor-content :editor="editor" />
  </div>
</template>

<script>
import Document from '@tiptap/editor/nodes/document'
import Italic from '@tiptap/editor/marks/italic'
import Paragraph from '@tiptap/editor/nodes/paragraph'
import Text from '@tiptap/editor/nodes/text'
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
      extensions: [Document, Paragraph, Text, Italic],
      content: `
        <p>This isn’t italic.</p>
        <p><em>This is italic.</em></p>
        <p><i>And this.</i></p>
        <p style="font-style: italic">This as well.</p>
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
}
</style>
