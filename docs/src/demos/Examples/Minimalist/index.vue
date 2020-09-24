<template>
  <editor-content :editor="editor" />
</template>

<script>
import { Editor, EditorContent } from '@tiptap/vue-starter-kit'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'

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
      content: `
        <p>
          This is a radically reduced version of tiptap. It has only support for a document, paragraphs and text. That’s it. It’s probably too much for real minimalists though.
        </p>
        <p>
          The paragraph extension is not literally required, but you need at least one node. That node can be something different, for example to render a task list and only that task list.
        </p>
      `,
      extensions: [
        Document(),
        Paragraph(),
        Text(),
      ],
    })
  },

  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>
