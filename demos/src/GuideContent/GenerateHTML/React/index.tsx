import { Bold } from '@tiptap/editor/extensions/bold'
// Option 2: Browser-only (lightweight)
// import { generateHTML } from '@tiptap/editor'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
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
