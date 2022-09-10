import './styles.scss'

import Link from '@tiptap/extension-link'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import React from 'react'

export default () => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        validate: link => /^https?:\/\//.test(link),
      }),
    ],
    content: `
      <p>Hey! Try to type in url with and without a http/s protocol. - Links without a protocol should not get auto linked</p>
    `,
    editorProps: {
      attributes: {
        spellcheck: 'false',
      },
    },
  })

  return (
    <div>
      <EditorContent editor={editor} />
    </div>
  )
}
