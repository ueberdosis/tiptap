import './styles.scss'

import { Code } from '@tiptap/editor/extensions/code'
import { CodeBlock } from '@tiptap/editor/extensions/code-block'
import { Document } from '@tiptap/editor/extensions/document'
import { BulletList, ListItem } from '@tiptap/editor/extensions/list'
import { Paragraph } from '@tiptap/editor/extensions/paragraph'
import { Text } from '@tiptap/editor/extensions/text'
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
