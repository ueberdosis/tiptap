import './styles.scss'

import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCaret from '@tiptap/extension-collaboration-caret'
import Document from '@tiptap/editor/nodes/document'
import Paragraph from '@tiptap/editor/nodes/paragraph'
import Text from '@tiptap/editor/nodes/text'
import { Placeholder } from '@tiptap/editor/extensions/placeholder'
import { EditorContent, useEditor } from '@tiptap/react'
import React from 'react'
import { WebrtcProvider } from 'y-webrtc'
import * as Y from 'yjs'

const ydoc = new Y.Doc()
const provider = new WebrtcProvider('tiptap-collaboration-caret-extension', ydoc)

function Component() {
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Collaboration.configure({
        document: ydoc,
      }),
      CollaborationCaret.configure({
        provider,
        user: {
          name: 'Cyndi Lauper',
          color: '#f783ac',
        },
      }),
      Placeholder.configure({
        placeholder: 'Write something … It’ll be shared with everyone else looking at this example.',
      }),
    ],
  })

  return <EditorContent editor={editor} />
}

function App() {
  const useStrictMode = true

  return useStrictMode ? (
    <React.StrictMode>
      <Component />
    </React.StrictMode>
  ) : (
    <Component />
  )
}

export default App
