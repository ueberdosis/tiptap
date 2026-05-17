<template>
  <pre><code>{{ output }}</code></pre>
</template>

<script>
// Option 1: Browser + server-side
import Bold from '@tiptap/editor/marks/bold'
// Option 2: Browser-only (lightweight)
// import { generateJSON } from '@tiptap/core'
import Document from '@tiptap/editor/nodes/document'
import Paragraph from '@tiptap/editor/nodes/paragraph'
import Text from '@tiptap/editor/nodes/text'
import { generateJSON } from '@tiptap/html'

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
