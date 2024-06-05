import { TiptapCollabProvider } from '@hocuspocus/provider'
import { Collaboration } from '@tiptap/extension-collaboration'
import { EditorContent, useEditor } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import React, { useEffect } from 'react'
import * as Y from 'yjs'

import { TNote } from './types.js'

export default ({ note }: { note: TNote }) => {
  const doc = new Y.Doc()

  useEffect(() => {
    const provider = new TiptapCollabProvider({
      name: note.id, // any identifier - all connections sharing the same identifier will be synced
      appId: '7j9y6m10', // replace with YOUR_APP_ID
      token: 'notoken', // replace with your JWT
      document: doc,
    })

    return () => {
      provider.destroy()
    }
  }, [note.id])

  const editor = useEditor({
    // make sure that you don't use `content` property anymore!
    // If you want to add default content, feel free to just write text to the Tiptap editor (i.e. editor.setContent (https://tiptap.dev/api/commands/set-content), but make sure that
    // you do this only once per document, otherwise the content will
    // be added again, and again, and again ..
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
