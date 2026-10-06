import './styles.scss'

import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Subscript from '@tiptap/extension-subscript'
import Text from '@tiptap/extension-text'
import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
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
  const { isSubscript } = useEditorState({
    editor,
    selector: ctx => ({
      isSubscript: ctx.editor.isActive('subscript') ?? false,
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
            onClick={() => editor.chain().focus().toggleSubscript().run()}
            className={isSubscript ? 'is-active' : ''}
          >
            Toggle subscript
          </button>
          <button
            onClick={() => editor.chain().focus().setSubscript().run()}
            disabled={isSubscript}
          >
            Set subscript
          </button>
          <button
            onClick={() => editor.chain().focus().unsetSubscript().run()}
            disabled={!isSubscript}
          >
            Unset subscript
          </button>
        </div>
      </div>

      <EditorContent editor={editor} />
    </>
  )
}
