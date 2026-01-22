import './styles.scss'

import Document from '@dibdab/extension-document'
import Paragraph from '@dibdab/extension-paragraph'
import Text from '@dibdab/extension-text'
import Underline from '@dibdab/extension-underline'
import { EditorContent, useEditor } from '@dibdab/react'
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
