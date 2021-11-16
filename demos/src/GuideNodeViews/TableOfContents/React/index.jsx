import React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TableOfContents from './TableOfContents.js'
import './styles.scss'

export default () => {
  const editor = useEditor({
    extensions: [StarterKit, TableOfContents],
    content: `
        <toc></toc>
        <h2>1 heading</h2>
        <p>paragraph</p>
        <h3>1.1 heading</h3>
        <p>paragraph</p>
        <h3>1.2 heading</h3>
        <p>paragraph</p>
        <h2>2 heading</h2>
        <p>paragraph</p>
        <h3>2.1 heading</h3>
        <p>paragraph</p>
      `,
  })

  if (!editor) {
    return null
  }

  return <EditorContent editor={editor} />
}
