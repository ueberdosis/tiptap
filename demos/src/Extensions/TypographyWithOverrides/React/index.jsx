import Document from '@tiptap/editor/nodes/document'
import Paragraph from '@tiptap/editor/nodes/paragraph'
import Text from '@tiptap/editor/nodes/text'
import Typography from '@tiptap/extension-typography'
import { EditorContent, useEditor } from '@tiptap/react'
import React from 'react'

export default () => {
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Typography.configure({
        rightArrow: '=====>',
      }),
    ],
    content: `
        <p>“I have been suffering from Typomania all my life, a sickness that is incurable but not lethal.”</p>
        <p>— Erik Spiekermann, December 2008</p>
      `,
  })

  return <EditorContent editor={editor} />
}
