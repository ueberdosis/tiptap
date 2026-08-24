import './styles.scss'

import { Document } from '@tiptap/editor/extensions/document'
import { HorizontalRule } from '@tiptap/editor/extensions/horizontal-rule'
import { Paragraph } from '@tiptap/editor/extensions/paragraph'
import { Text } from '@tiptap/editor/extensions/text'
import { EditorContent, useEditor } from '@tiptap/react'
import React from 'react'

export default () => {
  const editor = useEditor({
    extensions: [Document, Paragraph, Text, HorizontalRule],
    content: `
        <p>This is a paragraph.</p>
        <hr>
        <p>And this is another paragraph.</p>
        <hr>
        <p>But between those paragraphs are horizontal rules.</p>
      `,
  })

  if (!editor) {
    return null
  }

  return (
    <>
      <div className="control-group">
        <div className="button-group">
          <button onClick={() => editor.chain().focus().setHorizontalRule().run()}>
            Set horizontal rule
          </button>
        </div>
      </div>

      <EditorContent editor={editor} />
    </>
  )
}
