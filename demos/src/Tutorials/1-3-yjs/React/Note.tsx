import { Collaboration } from '@tiptap/extension-collaboration'
import { EditorContent, useEditor } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import React from 'react'
import * as Y from 'yjs'

import { TNote } from './types.js'

export default ({ note }: { note: TNote }) => {
  const doc = new Y.Doc()

  const editor = useEditor({
    content: note.defaultContent,
    editorProps: {
      attributes: {
        class: 'textarea',
      },
    },
    extensions: [
      StarterKit.configure({
        history: false, // important because history will now be handled by Y.js
      }),
      Collaboration.configure({
        document: doc,
      }),
    ],
  })

  return (
    // @ts-ignore
    <EditorContent editor={editor}/>
  )
}
