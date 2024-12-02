<template>
  <div v-if="editor" class="container">
    <div className="control-group">
      <div className="button-group">
        <button @click="editor.chain().focus().setHardBreak().run()">
          Set hard break
        </button>
      </div>
    </div>
    <editor-content :editor="editor" />
  </div>
</template>

<script>
import Document from '@tiptap/extension-document'
import HardBreak from '@tiptap/extension-hard-break'
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
        HardBreak,
      ],
      content: `
        <p>
          This<br>
          is<br>
          a<br>
          single<br>
          paragraph<br>
          with<br>
          line<br>
          breaks.
        </p>
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
