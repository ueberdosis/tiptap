import React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Italic from '@tiptap/extension-italic'

export default () => {
  const editor = useEditor({
    extensions: [Document, Paragraph, Text, Italic],
    content: `
        <p>This isn’t italic.</p>
        <p><em>This is italic.</em></p>
        <p><i>And this.</i></p>
        <p style="font-style: italic">This as well.</p>
      `,
  })

  if (!editor) {
    return null
  }

  return (
    <>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive('italic') ? 'is-active' : ''}
      >
        toggleItalic
      </button>
      <button
        onClick={() => editor.chain().focus().setItalic().run()}
        disabled={editor.isActive('italic')}
      >
        setItalic
      </button>
      <button
        onClick={() => editor.chain().focus().unsetItalic().run()}
        disabled={!editor.isActive('italic')}
      >
        unsetItalic
      </button>

      <EditorContent editor={editor} />
    </>
  )
}
