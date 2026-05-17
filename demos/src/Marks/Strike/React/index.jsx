import './styles.scss'

import Document from '@tiptap/editor/nodes/document'
import Paragraph from '@tiptap/editor/nodes/paragraph'
import Strike from '@tiptap/editor/marks/strike'
import Text from '@tiptap/editor/nodes/text'
import { EditorContent, useEditor } from '@tiptap/react'
import React from 'react'

export default () => {
  const editor = useEditor({
    extensions: [Document, Paragraph, Text, Strike],
    content: `
          <p>This isn’t striked through.</s></p>
          <p><s>But that’s striked through.</s></p>
          <p><del>And this.</del></p>
          <p><strike>This too.</strike></p>
          <p style="text-decoration: line-through">This as well.</p>
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
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={editor.isActive('strike') ? 'is-active' : ''}
          >
            Toggle strike
          </button>
          <button onClick={() => editor.chain().focus().setStrike().run()} disabled={editor.isActive('strike')}>
            Set strike
          </button>
          <button onClick={() => editor.chain().focus().unsetStrike().run()} disabled={!editor.isActive('strike')}>
            Unset strike
          </button>
        </div>
      </div>
      <EditorContent editor={editor} />
    </>
  )
}
