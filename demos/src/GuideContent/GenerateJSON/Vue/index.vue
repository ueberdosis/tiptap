<template>
  <pre><code>{{ output }}</code></pre>
</template>

<script>
// Option 1: Browser + server-side
import { Bold } from '@tiptap/editor/extensions/bold'
// Option 2: Browser-only (lightweight)
// import { generateJSON } from '@tiptap/editor'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
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
