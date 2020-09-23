<template>
  <pre>{{ html }}</pre>
</template>

<script>
import { generateHtml } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'

export default {
  data() {
    return {
      doc: {
        type: 'document',
        content: [{
          type: 'paragraph',
          attrs: {
            align: 'left',
          },
          content: [{
            type: 'text',
            text: 'Example Text',
          }],
        }],
      },
    }
  },

  computed: {
    html() {
      return generateHtml(this.doc, [
        Document(),
        Paragraph(),
        Text(),
      ])
    },
  },
}
</script>
