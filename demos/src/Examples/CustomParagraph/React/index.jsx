import './styles.scss'

import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import React from 'react'

import { Paragraph } from './Paragraph.jsx'

export default () => {
  const editor = useEditor({
    immediatelyRender: true,
    shouldRerenderOnTransaction: false,
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

  console.count('render')

  return (
    <EditorContent editor={editor} />
  )
}
