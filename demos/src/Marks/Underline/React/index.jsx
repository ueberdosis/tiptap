import './styles.scss'

import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Underline from '@tiptap/extension-underline'
import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
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
  const { isUnderline } = useEditorState({
    editor,
    selector: ctx => ({
      isUnderline: ctx.editor.isActive('underline') ?? false,
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
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={isUnderline ? 'is-active' : ''}
          >
            Toggle underline
          </button>
          <button
            onClick={() => editor.chain().focus().setUnderline().run()}
            disabled={isUnderline}
          >
            Set underline
          </button>
          <button
            onClick={() => editor.chain().focus().unsetUnderline().run()}
            disabled={!isUnderline}
          >
            Unset underline
          </button>
        </div>
      </div>

      <EditorContent editor={editor} />
    </>
  )
}
