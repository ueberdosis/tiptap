<template>
  <pre>{{ this.html }}</pre>
</template>

<script>
import { generateHtml } from '@tiptap/core'
import { defaultExtensions } from '@tiptap/vue-starter-kit'

export default {

  data() {
    return {
      doc: {
        'type': 'document',
        'content': [{
          'type': 'paragraph',
          'attrs': {
            'align': 'left'
          },
          'content': [{
            'type': 'text',
            'text': 'My sample text'
          }]
        }]
      }
    }
  },

  computed: {
    html() {
      const extensions = defaultExtensions()

      return generateHtml(this.doc, extensions)
    }
  }

}
</script>