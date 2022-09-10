import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Subscript from '@tiptap/extension-subscript'
import Text from '@tiptap/extension-text'
import { EditorContent, useEditor } from '@tiptap/react'
import React from 'react'

export default () => {
  const editor = useEditor({
    extensions: [Document, Paragraph, Text, Subscript],
    content: `
        <p>This is regular text.</p>
        <p><sub>This is subscript.</sub></p>
        <p><span style="vertical-align: sub">And this.</span></p>
      `,
  })

  if (!editor) {
    return null
  }

  return (
    <>
      <button
        onClick={() => editor.chain().focus().toggleSubscript().run()}
        className={editor.isActive('subscript') ? 'is-active' : ''}
      >
        toggleSubscript
      </button>
      <button
        onClick={() => editor.chain().focus().setSubscript().run()}
        disabled={editor.isActive('subscript')}
      >
        setSubscript
      </button>
      <button
        onClick={() => editor.chain().focus().unsetSubscript().run()}
        disabled={!editor.isActive('subscript')}
      >
        unsetSubscript
      </button>

      <EditorContent editor={editor} />
    </>
  )
}
