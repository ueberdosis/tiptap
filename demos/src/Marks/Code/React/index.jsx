import './styles.scss'

import Code from '@tiptap/editor/marks/code'
import Document from '@tiptap/editor/nodes/document'
import Paragraph from '@tiptap/editor/nodes/paragraph'
import Text from '@tiptap/editor/nodes/text'
import { EditorContent, useEditor } from '@tiptap/react'
import React from 'react'

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
      <div className="control-group">
        <div className="button-group">
          <button
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={editor.isActive('code') ? 'is-active' : ''}
          >
            Toggle code
          </button>
          <button onClick={() => editor.chain().focus().setCode().run()} disabled={editor.isActive('code')}>
            Set code
          </button>
          <button onClick={() => editor.chain().focus().unsetCode().run()} disabled={!editor.isActive('code')}>
            Unset code
          </button>
        </div>
      </div>
      <EditorContent editor={editor} />
    </>
  )
}
