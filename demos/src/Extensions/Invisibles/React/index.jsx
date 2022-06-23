import './styles.scss'

import Document from '@tiptap/extension-document'
import HardBreak from '@tiptap/extension-hard-break'
import Image from '@tiptap/extension-image'
import Invisibles from '@tiptap/extension-invisibles'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { EditorContent, useEditor } from '@tiptap/react'
import React from 'react'

export default () => {
  const editor = useEditor({
    extensions: [Document, Paragraph, Text, Image, Invisibles, HardBreak],
    content: `
        <p>This content should show invisible characters.<br />Line breaks should also work just fine. How nice is this?</p>
        <p>Try editing the content to see different types of characters.</p>
      `,
  })

  return <EditorContent editor={editor} />
}
