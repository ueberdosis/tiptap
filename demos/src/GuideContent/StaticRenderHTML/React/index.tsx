import Bold from '@dibdab/extension-bold'
import Document from '@dibdab/extension-document'
import Paragraph from '@dibdab/extension-paragraph'
import Text from '@dibdab/extension-text'
import { renderToHTMLString } from '@dibdab/static-renderer'
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
 * This example demonstrates how to render a Prosemirror Node (or JSON Content) to an HTML string.
 * It will use your extensions to render the content based on each Node's/Mark's `renderHTML` method.
 * This can be useful if you want to render content to HTML without having an actual editor instance.
 *
 * You have complete control over the rendering process. And can replace how each Node/Mark is rendered.
 */
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
