<template>
  <pre><code>{{ output }}</code></pre>
</template>

<script>
// Option 1: Browser + server-side
import Bold from '@dibdab/extension-bold'
// Option 2: Browser-only (lightweight)
// import { generateHTML } from '@dibdab/core'
import Document from '@dibdab/extension-document'
import Paragraph from '@dibdab/extension-paragraph'
import Text from '@dibdab/extension-text'
import { generateHTML } from '@dibdab/html'

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
      return generateHTML(json, [
        Document,
        Paragraph,
        Text,
        Bold,
        // other extensions …
      ])
    },
  },
}
</script>
