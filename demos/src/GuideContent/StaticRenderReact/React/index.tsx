import Bold from '@tiptap/editor/marks/bold'
import Document from '@tiptap/editor/nodes/document'
import Paragraph from '@tiptap/editor/nodes/paragraph'
import Text from '@tiptap/editor/nodes/text'
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
 * This example demonstrates how to render a Prosemirror Node (or JSON Content) to a React Element.
 * It will use your extensions to render the content based on each Node's/Mark's `renderHTML` method.
 * This can be useful if you want to render content to React without having an actual editor instance.
 *
 * You have complete control over the rendering process. And can replace how each Node/Mark is rendered.
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
