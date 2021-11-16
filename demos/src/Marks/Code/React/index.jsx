import React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Code from '@tiptap/extension-code'
import './styles.scss'

export default () => {
  const editor = useEditor({
    extensions: [Document, Paragraph, Text, Code],
    content: `
        <p>This isn’t code.</p>
        <p><code>This is code.</code></p>
      `,
  })

  if (!editor) {
    return null
  }

  return (
    <>
      <button
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={editor.isActive('code') ? 'is-active' : ''}
      >
        toggleCode
      </button>
      <button
        onClick={() => editor.chain().focus().setCode().run()}
        disabled={editor.isActive('code')}
      >
        setCode
      </button>
      <button
        onClick={() => editor.chain().focus().unsetCode().run()}
        disabled={!editor.isActive('code')}
      >
        unsetCode
      </button>

      <EditorContent editor={editor} />
    </>
  )
}
