import './styles.scss'

import Document from '@tiptap/editor/nodes/document'
import HardBreak from '@tiptap/editor/nodes/hard-break'
import Paragraph from '@tiptap/editor/nodes/paragraph'
import Text from '@tiptap/editor/nodes/text'
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
          <button onClick={() => editor.chain().focus().setHardBreak().run()}>Set hard break</button>
        </div>
      </div>
      <EditorContent editor={editor} />
    </>
  )
}
