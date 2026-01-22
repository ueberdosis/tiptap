import './styles.scss'

import { TiptapTransformer } from '@hocuspocus/transformer'
import Collaboration from '@dibdab/extension-collaboration'
import Document from '@dibdab/extension-document'
import Heading from '@dibdab/extension-heading'
import Paragraph from '@dibdab/extension-paragraph'
import Text from '@dibdab/extension-text'
import UniqueID from '@dibdab/extension-unique-id'
import { EditorContent, useEditor } from '@dibdab/react'
import React from 'react'

const doc = TiptapTransformer.toYdoc({
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 1 },
      content: [{ type: 'text', text: 'This is a predefined, collaborative ydoc' }],
    },
    {
      type: 'paragraph',
      content: [{ type: 'text', text: "Let's see how this works out." }],
    },
    {
      type: 'paragraph',
      content: [{ type: 'text', text: 'This should now generate unique IDs correctly' }],
    },
  ],
})

export default () => {
  const editor = useEditor({
    extensions: [
      Document,
      Heading,
      Paragraph,
      Text,
      Collaboration.configure({
        document: doc,
      }),
      UniqueID.configure({
        types: ['heading', 'paragraph'],
        filterTransaction: () => true,
      }),
    ],
  })

  return <EditorContent editor={editor} />
}
