<template>
  <pre><code>{{ output }}</code></pre>
</template>

<script>
import Bold from '@tiptap/extension-bold'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { renderToHTMLString } from '@tiptap/static-renderer'

const json = {
  type: 'doc',
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
}

export default {
  computed: {
    output() {
      return renderToHTMLString({
        content: json,
        extensions: [
          Document,
          Paragraph,
          Text,
          Bold,
          // other extensions …
        ],
      })
    },
  },
}
</script>
