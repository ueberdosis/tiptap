<template>
  <div>
    <pre>{{ html }}</pre>
    <pre>{{ otherHtml }}</pre>
  </div>
</template>

<script>
import { generateHTML } from '@tiptap/core'
import { generateHTML as generateHTMLWithoutEditor } from '@tiptap/html'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'

export default {
  data() {
    return {
      json: {
        type: 'document',
        content: [{
          type: 'paragraph',
          content: [{
            type: 'text',
            text: 'Example Text',
          }],
        }],
      },
      html: '',
      otherHtml: '',
    }
  },

  mounted() {
    this.html = generateHTML(this.json, [
      Document(),
      Paragraph(),
      Text(),
    ])

    this.otherHtml = generateHTMLWithoutEditor(this.json, [
      Document(),
      Paragraph(),
      Text(),
    ])
  },
}
</script>
