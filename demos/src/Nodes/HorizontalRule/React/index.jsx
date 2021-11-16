import React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import HorizontalRule from '@tiptap/extension-horizontal-rule'
import './styles.scss'

export default () => {
  const editor = useEditor({
    extensions: [Document, Paragraph, Text, HorizontalRule],
    content: `
        <p>This is a paragraph.</p>
        <hr>
        <p>And this is another paragraph.</p>
        <hr>
        <p>But between those paragraphs are horizontal rules.</p>
      `,
  })

  if (!editor) {
    return null
  }

  return (
    <>
      <button onClick={() => editor.chain().focus().setHorizontalRule().run()}>
        setHorizontalRule
      </button>

      <EditorContent editor={editor} />
    </>
  )
}
