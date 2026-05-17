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
        <p>The Paragraph extension is not required, but it’s very likely you want to use it. It’s needed to write paragraphs of text. 🤓</p>
      `,
  })

  if (!editor) {
    return null
  }

  return <EditorContent editor={editor} />
}
