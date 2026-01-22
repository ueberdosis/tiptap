import './styles.scss'

import Code from '@dibdab/extension-code'
import CodeBlock from '@dibdab/extension-code-block'
import Document from '@dibdab/extension-document'
import { BulletList, ListItem } from '@dibdab/extension-list'
import Paragraph from '@dibdab/extension-paragraph'
import Text from '@dibdab/extension-text'
import { TrailingNode } from '@dibdab/extensions'
import { EditorContent, useEditor } from '@dibdab/react'
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
