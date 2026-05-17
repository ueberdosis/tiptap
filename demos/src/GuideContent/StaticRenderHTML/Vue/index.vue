<template>
  <pre><code>{{ output }}</code></pre>
</template>

<script>
import Bold from '@tiptap/editor/marks/bold'
import Document from '@tiptap/editor/nodes/document'
import Paragraph from '@tiptap/editor/nodes/paragraph'
import Text from '@tiptap/editor/nodes/text'
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

/**
 * This example demonstrates how to render a Prosemirror Node (or JSON Content) to an HTML string.
 * It will use your extensions to render the content based on each Node's/Mark's `renderHTML` method.
 * This can be useful if you want to render content to HTML without having an actual editor instance.
 *
 * You have complete control over the rendering process. And can replace how each Node/Mark is rendered.
 */
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
