<template>
  <pre><code>{{ output }}</code></pre>
</template>

<script>
import { generateHTML } from '@tiptap/html'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Bold from '@tiptap/extension-bold'

export default {
  data() {
    return {
      output: '',
      json: {
        type: 'document',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Example ',
              },
              {
                type: 'text',
                marks: [
                  {
                    type: 'bold',
                  },
                ],
                text: 'Text',
              },
            ],
          },
        ],
      },
    }
  },

  mounted() {
    this.output = generateHTML(this.json, [
      Document,
      Paragraph,
      Text,
      Bold,
    ])
  },
}
</script>
