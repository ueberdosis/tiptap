import './styles.scss'

import Document from '@tiptap/editor/nodes/document'
import Image from '@tiptap/extension-image'
import Paragraph from '@tiptap/editor/nodes/paragraph'
import Text from '@tiptap/editor/nodes/text'
import { Dropcursor } from '@tiptap/editor/extensions/dropcursor'
import { EditorContent, useEditor } from '@tiptap/react'
import React from 'react'

export default () => {
  const editor = useEditor({
    extensions: [Document, Paragraph, Text, Image, Dropcursor],
    content: `
        <p>Try to drag around the image. While you drag, the editor should show a decoration under your cursor. The so called dropcursor.</p>
        <img src="https://placehold.co/800x400" />
      `,
  })

  return <EditorContent editor={editor} />
}
