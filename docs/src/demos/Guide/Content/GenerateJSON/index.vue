<template>
  <pre><code>{{ output }}</code></pre>
</template>

<script>
import { generateJSON } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Bold from '@tiptap/extension-bold'

const html = '<p>Example <strong>Text</strong></p>'

export default {
  computed: {
    output() {
      return generateJSON(html, [
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
