import Bold from '@tiptap/extension-bold'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { renderToReactElement } from '@tiptap/static-renderer'
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

/**
 * This will statically render the JSON into React elements, which can be directly rendered in the DOM (even on the server).
 */
export default () => {
  const output = useMemo(() => {
    return renderToReactElement({
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

  return <div>{output}</div>
}
