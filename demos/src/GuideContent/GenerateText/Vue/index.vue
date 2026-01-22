<template>
  <pre><code>{{ output }}</code></pre>
</template>

<script>
import { generateText } from '@dibdab/core'
import Document from '@dibdab/extension-document'
import HardBreak from '@dibdab/extension-hard-break'
import Paragraph from '@dibdab/extension-paragraph'
import Text from '@dibdab/extension-text'

const json = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'This is a paragraph.',
        },
      ],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'Here is another paragraph …',
        },
        {
          type: 'hardBreak',
        },
        {
          type: 'text',
          text: '… with an hard break.',
        },
      ],
    },
  ],
}

export default {
  computed: {
    output() {
      return generateText(
        json,
        [
          Document,
          Paragraph,
          Text,
          HardBreak,
          // other extensions …
        ],
        {
          // define a custom block separator if you want to
          blockSeparator: '\n\n',
        },
      )
    },
  },
}
</script>
