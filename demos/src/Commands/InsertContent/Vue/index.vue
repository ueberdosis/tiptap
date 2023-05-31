<template>
  <div v-if="editor">
    <button @click="insertContentByString">Insert content by string</button>
    <button @click="insertContentByJSON">Insert content by JSON</button>
    <button @click="insertTextByJSON">Insert text by JSON</button>
    <button @click="insertTextByJSONArray">Insert text by JSON Array</button>
  </div>
  <editor-content :editor="editor" />
</template>

<script>
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
      ],
      content: `
        <p>
          This is a radically reduced version of tiptap. It has support for a document, with paragraphs and text. That’s it. It’s probably too much for real minimalists though.
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

  methods: {
    insertContentByString() {
      this.editor.chain().focus().insertContent('<p>Hello World</p>').run()
    },
    insertContentByJSON() {
      this.editor.chain().focus().insertContent({
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'Hello',
          },
          {
            type: 'text',
            text: ' ',
          },
          {
            type: 'text',
            text: 'World',
          },
        ],
      }).run()
    },
    insertTextByJSON() {
      this.editor.chain().focus().insertContent({
        type: 'text',
        text: 'Hello World',
      }).run()
    },
    insertTextByJSONArray() {
      this.editor.chain().focus().insertContent([{
        type: 'text',
        text: 'Hello',
      }, {
        type: 'text',
        text: ' ',
      }, {
        type: 'text',
        text: 'World',
      }]).run()
    },
  },
}
</script>

<style lang="scss">
/* Basic editor styles */
.tiptap {
  > * + * {
    margin-top: 0.75em;
  }
}
</style>
