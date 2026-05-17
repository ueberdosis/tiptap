import './styles.scss'

import Code from '@tiptap/editor/marks/code'
import CodeBlock from '@tiptap/editor/nodes/code-block'
import Document from '@tiptap/editor/nodes/document'
import { BulletList } from '@tiptap/editor/nodes/bullet-list'
import { ListItem } from '@tiptap/editor/nodes/list-item'
import Paragraph from '@tiptap/editor/nodes/paragraph'
import Text from '@tiptap/editor/nodes/text'
import { TrailingNode } from '@tiptap/editor/extensions/trailing-node'
import { EditorContent, useEditor } from '@tiptap/react'
import React from 'react'

export default () => {
  const editor = useEditor({
    extensions: [Document, Paragraph, Text, TrailingNode, Code, BulletList, ListItem, CodeBlock],
    content: `
        <p>A paragraph</p>
        <pre><code>There should be a paragraph right after this one, because it is a code-block</code></pre>
      `,
  })

  return <EditorContent editor={editor} />
}
