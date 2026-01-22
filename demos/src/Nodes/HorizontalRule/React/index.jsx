import './styles.scss'

import Document from '@dibdab/extension-document'
import HorizontalRule from '@dibdab/extension-horizontal-rule'
import Paragraph from '@dibdab/extension-paragraph'
import Text from '@dibdab/extension-text'
import { EditorContent, useEditor } from '@dibdab/react'
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
          <button onClick={() => editor.chain().focus().setHorizontalRule().run()}>Set horizontal rule</button>
        </div>
      </div>

      <EditorContent editor={editor} />
    </>
  )
}
