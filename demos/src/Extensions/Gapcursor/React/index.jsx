import './styles.scss'

import Document from '@dibdab/extension-document'
import Image from '@dibdab/extension-image'
import Paragraph from '@dibdab/extension-paragraph'
import Text from '@dibdab/extension-text'
import { Gapcursor } from '@dibdab/extensions'
import { EditorContent, useEditor } from '@dibdab/react'
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
