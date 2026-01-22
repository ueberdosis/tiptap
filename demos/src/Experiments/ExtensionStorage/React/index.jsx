import './styles.scss'

import Document from '@dibdab/extension-document'
import Paragraph from '@dibdab/extension-paragraph'
import Text from '@dibdab/extension-text'
import { EditorContent, useEditor } from '@dibdab/react'
import React from 'react'

import { CustomExtension } from './CustomExtension.ts'

export default () => {
  const editor = useEditor({
    extensions: [Document, Paragraph, Text, CustomExtension],
    content: `
      <p>
        This is a radically reduced version of Tiptap. It has support for a document, with paragraphs and text. That’s it. It’s probably too much for real minimalists though.
      </p>
      <p>
        The paragraph extension is not really required, but you need at least one node. Sure, that node can be something different.
      </p>
    `,
  })

  return (
    <>
      <EditorContent editor={editor} />
      <div className="output-group">Reactive storage: {editor?.storage.custom.foo}</div>
    </>
  )
}
