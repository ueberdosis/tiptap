'use client'

import './styles.scss'

import Document from '@tiptap/extension-document'
import Text from '@tiptap/extension-text'
import { EditorContent, useEditor } from '@tiptap/react'

import Paper from './Paper.js'

export default () => {
  const editor = useEditor({
    extensions: [Document.extend({ content: 'paper' }), Text, Paper],
    content: {
      type: 'doc',
      content: [{ type: 'paper' }],
    },
  })

  return <EditorContent editor={editor} />
}
