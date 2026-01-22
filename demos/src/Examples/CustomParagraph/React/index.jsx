import './styles.scss'

import { EditorContent, useEditor } from '@dibdab/react'
import StarterKit from '@dibdab/starter-kit'
import React from 'react'

import { Paragraph } from './Paragraph.jsx'

export default () => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        paragraph: false,
      }),
      Paragraph,
    ],
    content: `
    <p>
      Each line shows the number of characters in the paragraph.
    </p>
    `,
  })

  return <EditorContent editor={editor} />
}
