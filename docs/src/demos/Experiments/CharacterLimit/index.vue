<template>
  <div>
    <editor-content :editor="editor" />
    <div>
      {{ characters }}/{{ limit }}
    </div>
  </div>
</template>

<script>
import { Editor, EditorContent } from '@tiptap/vue-starter-kit'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import CharacterLimit from './extension'

export default {
  components: {
    EditorContent,
  },

  data() {
    return {
      editor: null,
      limit: 10,
    }
  },

  mounted() {
    this.editor = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
        CharacterLimit.configure({
          limit: this.limit,
        }),
      ],
      content: `
        <p>
          This is a radically reduced version of tiptap. It has only support for a document, paragraphs and text. That’s it. It’s probably too much for real minimalists though.
        </p>
        <p>
          The paragraph extension is not really required, but you need at least one node. Sure, that node can be something different. You’ll mostly likely want to add a paragraph though.
        </p>
      `,
    })
  },

  computed: {
    characters() {
      if (this.editor) {
        return this.editor.state.doc.content.size - 2
      }

      return null
    },
  },

  beforeDestroy() {
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
}
</style>
