import './styles.scss'

import Blockquote from '@dibdab/extension-blockquote'
import Document from '@dibdab/extension-document'
import Paragraph from '@dibdab/extension-paragraph'
import Text from '@dibdab/extension-text'
import { EditorContent, useEditor } from '@dibdab/react'
import React from 'react'

export default () => {
  const editor = useEditor({
    extensions: [Document, Paragraph, Text, Blockquote],
    content: `
      <blockquote>
        Nothing is impossible, the word itself says “I’m possible!”
      </blockquote>
      <p>Audrey Hepburn</p>
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
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={editor.isActive('blockquote') ? 'is-active' : ''}
          >
            Toggle blockquote
          </button>
          <button onClick={() => editor.chain().focus().setBlockquote().run()} disabled={!editor.can().setBlockquote()}>
            Set blockquote
          </button>
          <button
            onClick={() => editor.chain().focus().unsetBlockquote().run()}
            disabled={!editor.can().unsetBlockquote()}
          >
            Unset blockquote
          </button>
        </div>
      </div>

      <EditorContent editor={editor} />
    </>
  )
}
