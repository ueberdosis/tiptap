import './styles.scss'

import { Document } from '@tiptap/editor/extensions/document'
import { HardBreak } from '@tiptap/editor/extensions/hard-break'
import { Paragraph } from '@tiptap/editor/extensions/paragraph'
import { Text } from '@tiptap/editor/extensions/text'
import { EditorContent, useEditor } from '@tiptap/react'
import React from 'react'

export default () => {
  const editor = useEditor({
    extensions: [Document, Paragraph, Text, HardBreak],
    content: `
        <p>
          This<br>
          is<br>
          a<br>
          single<br>
          paragraph<br>
          with<br>
          line<br>
          breaks.
        </p>
      `,
  })

  if (!editor) {
    return null
  }

  return (
    <>
      <div className="control-group">
        <div className="button-group">
          <button onClick={() => editor.chain().focus().setHardBreak().run()}>
            Set hard break
          </button>
        </div>
      </div>
      <EditorContent editor={editor} />
    </>
  )
}
