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
      <p>The popup uses <code>floatingUi</code> options to control placement, strategy, and middleware while the suggestion plugin keeps ownership of the anchor. It stays pinned to the top-start side and shifts inside the viewport.</p>
    `,
  })

  if (!editor) {
    return null
  }

  return <EditorContent editor={editor} />
}
