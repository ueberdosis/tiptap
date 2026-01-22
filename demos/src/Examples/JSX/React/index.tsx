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
      Each paragraph will be red
    </p>
    `,
  })

  return <EditorContent editor={editor} />
}
