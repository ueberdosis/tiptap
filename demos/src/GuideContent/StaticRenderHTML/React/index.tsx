import Bold from '@tiptap/extension-bold'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { renderToHTMLString } from '@tiptap/static-renderer'
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
  }, [])

  return (
    <pre>
      <code>{output}</code>
    </pre>
  )
}
