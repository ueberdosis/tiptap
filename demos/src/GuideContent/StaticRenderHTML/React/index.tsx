import Audio from '@tiptap/extension-audio'
import Bold from '@tiptap/extension-bold'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { domOutputSpecToHTMLString, renderToHTMLString } from '@tiptap/static-renderer'
import React, { useMemo } from 'react'

const nestedOutput = domOutputSpecToHTMLString(['div', ['span', 0], ['em', 0], ['strong', 0]])('x')

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
    { type: 'audio', attrs: { src: 'https://example.com/first.mp3' } },
    { type: 'audio', attrs: { src: 'https://example.com/second.mp3' } },
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
        Audio,
        // other extensions …
      ],
    })
  }, [])

  return (
    <pre>
      <code>
        {output}
        {'\n'}
        {nestedOutput}
      </code>
    </pre>
  )
}
