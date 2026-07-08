import './styles.scss'

import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { EditorContent, useEditor } from '@tiptap/react-experimental'
import React from 'react'

import ResizableNode from './Extension.js'

export default () => {
  const editor = useEditor({
    extensions: [Document, Paragraph, Text, ResizableNode],
    content: `
        <p>
          This is the resizable node demo under the experimental React
          renderer: the node is a plain React component with editable content
          — drag the corner handle to resize it.
        </p>
        <div data-resizer>
          <p>Test</p>
          <p>Test 2</p>
        </div>
        <div data-resizer width="800" height="500">
          <p>Test</p>
          <p>Test 2</p>
        </div>
      `,
  })

  return <EditorContent editor={editor} />
}
