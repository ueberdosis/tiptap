import './styles.scss'

import Document from '@tiptap/editor/nodes/document'
import Paragraph from '@tiptap/editor/nodes/paragraph'
import Text from '@tiptap/editor/nodes/text'
import Underline from '@tiptap/editor/marks/underline'
import { EditorContent, useEditor } from '@tiptap/react'
import React from 'react'

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
      <div className="control-group">
        <div className="button-group">
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={editor.isActive('underline') ? 'is-active' : ''}
          >
            Toggle underline
          </button>
          <button onClick={() => editor.chain().focus().setUnderline().run()} disabled={editor.isActive('underline')}>
            Set underline
          </button>
          <button
            onClick={() => editor.chain().focus().unsetUnderline().run()}
            disabled={!editor.isActive('underline')}
          >
            Unset underline
          </button>
        </div>
      </div>

      <EditorContent editor={editor} />
    </>
  )
}
