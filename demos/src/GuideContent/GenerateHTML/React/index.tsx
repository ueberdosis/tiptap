import Bold from '@tiptap/editor/marks/bold'
// Option 2: Browser-only (lightweight)
// import { generateHTML } from '@tiptap/core'
import Document from '@tiptap/editor/nodes/document'
import Paragraph from '@tiptap/editor/nodes/paragraph'
import Text from '@tiptap/editor/nodes/text'
// Option 1: Browser + server-side
import { generateHTML } from '@tiptap/html'
import React, { useMemo } from 'react'

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

export default () => {
  const output = useMemo(() => {
    return generateHTML(json, [
      Document,
      Paragraph,
      Text,
      Bold,
      // other extensions …
    ])
  }, [])

  return (
    <pre>
      <code>{output}</code>
    </pre>
  )
}
