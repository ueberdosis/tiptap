import './styles.scss'

import Document from '@dibdab/extension-document'
import Paragraph from '@dibdab/extension-paragraph'
import Subscript from '@dibdab/extension-subscript'
import Text from '@dibdab/extension-text'
import { EditorContent, useEditor } from '@dibdab/react'
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
      <div className="control-group">
        <div className="button-group">
          <button
            onClick={() => editor.chain().focus().toggleSubscript().run()}
            className={editor.isActive('subscript') ? 'is-active' : ''}
          >
            Toggle subscript
          </button>
          <button onClick={() => editor.chain().focus().setSubscript().run()} disabled={editor.isActive('subscript')}>
            Set subscript
          </button>
          <button
            onClick={() => editor.chain().focus().unsetSubscript().run()}
            disabled={!editor.isActive('subscript')}
          >
            Unset subscript
          </button>
        </div>
      </div>

      <EditorContent editor={editor} />
    </>
  )
}
