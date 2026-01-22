import './styles.scss'

import Document from '@dibdab/extension-document'
import Image from '@dibdab/extension-image'
import Paragraph from '@dibdab/extension-paragraph'
import Text from '@dibdab/extension-text'
import { Dropcursor } from '@dibdab/extensions'
import { EditorContent, useEditor } from '@dibdab/react'
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
