import React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Underline from '@tiptap/extension-underline'

export default () => {
  const editor = useEditor({
    extensions: [Document, Paragraph, Text, Underline],
    content: `
        <p>There is no underline here.</p>
        <p><u>This is underlined though.</u></p>
        <p style="text-decoration: underline">And this as well.</p>
      `,
  })

  if (!editor) {
    return null
  }

  return (
    <>
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={editor.isActive('underline') ? 'is-active' : ''}
      >
        toggleUnderline
      </button>
      <button
        onClick={() => editor.chain().focus().setUnderline().run()}
        disabled={editor.isActive('underline')}
      >
        setUnderline
      </button>
      <button
        onClick={() => editor.chain().focus().unsetUnderline().run()}
        disabled={!editor.isActive('underline')}
      >
        unsetUnderline
      </button>

      <EditorContent editor={editor} />
    </>
  )
}
