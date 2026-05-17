import './styles.scss'

import Document from '@tiptap/editor/nodes/document'
import Paragraph from '@tiptap/editor/nodes/paragraph'
import Superscript from '@tiptap/extension-superscript'
import Text from '@tiptap/editor/nodes/text'
import { EditorContent, useEditor } from '@tiptap/react'
import React from 'react'

export default () => {
  const editor = useEditor({
    extensions: [Document, Paragraph, Text, Superscript],
    content: `
        <p>This is regular text.</p>
        <p><sup>This is superscript.</sup></p>
        <p><span style="vertical-align: super">And this.</span></p>
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
            onClick={() => editor.chain().focus().toggleSuperscript().run()}
            className={editor.isActive('superscript') ? 'is-active' : ''}
          >
            Toggle superscript
          </button>
          <button
            onClick={() => editor.chain().focus().setSuperscript().run()}
            disabled={editor.isActive('superscript')}
          >
            Set superscript
          </button>
          <button
            onClick={() => editor.chain().focus().unsetSuperscript().run()}
            disabled={!editor.isActive('superscript')}
          >
            Unset superscript
          </button>
        </div>
      </div>

      <EditorContent editor={editor} />
    </>
  )
}
