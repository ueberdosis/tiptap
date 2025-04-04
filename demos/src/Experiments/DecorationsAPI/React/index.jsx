import './styles.scss'

import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import React from 'react'

import { SelectionDecorations } from './SelectionDecoration.js'
import { StarDecoration } from './StarDecoration.js'

export default () => {
  const editor = useEditor({
    extensions: [StarterKit, StarDecoration, SelectionDecorations],
    content: `
      <p>This is a fancy example for the decorations API.</p>
    `,
  })

  return (
    <>
      <EditorContent editor={editor} />
    </>
  )
}
