import './styles.scss'

import Document from '@tiptap/extension-document'
import Mention from '@tiptap/extension-mention'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { EditorContent, useEditor } from '@tiptap/react'
import React from 'react'

import suggestion from './suggestion.js'

export default () => {
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Mention.configure({
        HTMLAttributes: {
          class: 'mention',
        },
        suggestion,
      }),
    ],
    content: `
      <p>Try mentioning a colleague by typing <code>@</code>.</p>
      <p>The suggestion popup tries to appear <strong>above</strong> the cursor (<code>placement: 'top-start'</code>). If there isn't enough space it flips below (<code>flip: true</code>).</p>
    `,
  })

  if (!editor) {
    return null
  }

  return <EditorContent editor={editor} />
}
