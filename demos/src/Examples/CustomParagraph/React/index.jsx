import './styles.scss'

import { useEditor, Tiptap } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
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

  return <Tiptap instance={editor}>
    <Tiptap.Content />
  </Tiptap>
}
