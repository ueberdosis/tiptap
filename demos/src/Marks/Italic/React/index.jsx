import './styles.scss'

import Document from '@tiptap/extension-document'
import Italic from '@tiptap/extension-italic'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { EditorContent, useEditor } from '@tiptap/react'
import React from 'react'

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
      <div className="control-group">
        <div className="button-group">
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? 'is-active' : ''}
          >
            Toggle italic
          </button>
          <button
            onClick={() => editor.chain().focus().setItalic().run()}
            disabled={editor.isActive('italic')}
          >
            Set italic
          </button>
          <button
            onClick={() => editor.chain().focus().unsetItalic().run()}
            disabled={!editor.isActive('italic')}
          >
            Unset italic
          </button>
        </div>
      </div>
      <EditorContent editor={editor} />
    </>
  )
}
