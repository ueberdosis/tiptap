import './styles.scss'

import Document from '@tiptap/editor/nodes/document'
import Paragraph from '@tiptap/editor/nodes/paragraph'
import Text from '@tiptap/editor/nodes/text'
import { EditorContent, useEditor } from '@tiptap/react'
import React from 'react'

export default () => {
  const editor = useEditor({
    extensions: [Document, Paragraph, Text],
    content: `
        <p>The Document extension is required. Though, you can write your own implementation, e. g. to give it custom name.</p>
      `,
  })

  if (!editor) {
    return null
  }

  return <EditorContent editor={editor} />
}
