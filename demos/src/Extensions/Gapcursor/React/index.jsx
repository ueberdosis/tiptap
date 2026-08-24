import './styles.scss'

import { Document } from '@tiptap/editor/extensions/document'
import { Image } from '@tiptap/editor/extensions/image'
import { Paragraph } from '@tiptap/editor/extensions/paragraph'
import { Text } from '@tiptap/editor/extensions/text'
import { Gapcursor } from '@tiptap/editor/extensions/gap-cursor'
import { EditorContent, useEditor } from '@tiptap/react'
import React from 'react'

export default () => {
  const editor = useEditor({
    extensions: [Document, Paragraph, Text, Image, Gapcursor],
    content: `
        <p>Try to move the cursor after the image with your arrow keys! You should see a horizontal blinking cursor below the image. This is the gapcursor.</p>
        <img src="https://placehold.co/800x400" />
      `,
  })

  return <EditorContent editor={editor} />
}
