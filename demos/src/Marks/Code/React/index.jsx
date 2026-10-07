import './styles.scss'

import Code from '@tiptap/extension-code'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
import React from 'react'

export default () => {
  const editor = useEditor({
    extensions: [Document, Paragraph, Text, Code],
    content: `
        <p>This isn’t code.</p>
        <p><code>This is code.</code></p>
      `,
  })
  const { isCode } = useEditorState({
    editor,
    selector: ctx => ({
      isCode: ctx.editor.isActive('code') ?? false,
    }),
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
            className={isCode ? 'is-active' : ''}
          >
            Toggle code
          </button>
          <button onClick={() => editor.chain().focus().setCode().run()} disabled={isCode}>
            Set code
          </button>
          <button onClick={() => editor.chain().focus().unsetCode().run()} disabled={!isCode}>
            Unset code
          </button>
        </div>
      </div>
      <EditorContent editor={editor} />
    </>
  )
}
