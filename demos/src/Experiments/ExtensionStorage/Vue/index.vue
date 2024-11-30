<template>
  <div class="container">
    <editor-content :editor="editor" />
    <div class="output-group">
      Reactive storage: {{ editor?.storage.custom.foo }}
    </div>
  </div>
</template>

<script>
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { Editor, EditorContent } from '@tiptap/vue-3'

import { CustomExtension } from './CustomExtension.ts'

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
        CustomExtension,
      ],
      content: `
        <p>
          This is a radically reduced version of Tiptap. It has support for a document, with paragraphs and text. That’s it. It’s probably too much for real minimalists though.
        </p>
        <p>
          The paragraph extension is not really required, but you need at least one node. Sure, that node can be something different.
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
