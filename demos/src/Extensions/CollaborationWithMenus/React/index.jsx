import './styles.scss'

import Bold from '@tiptap/extension-bold'
import Collaboration from '@tiptap/extension-collaboration'
import Document from '@tiptap/extension-document'
import Heading from '@tiptap/extension-heading'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { Placeholder } from '@tiptap/extensions'
import { useEditor, useTiptap, Tiptap } from '@tiptap/react'
import React from 'react'
import { WebrtcProvider } from 'y-webrtc'
import * as Y from 'yjs'

const ydoc = new Y.Doc()

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const provider = new WebrtcProvider('tiptap-collaboration-extension', ydoc)

const BubbleMenuContent = () => {
  const { editor } = useTiptap()

  return (
    <div className="bubble-menu">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive('bold') ? 'is-active' : ''}
      >
        Bold
      </button>
    </div>
  )
}

const FloatingMenuContent = () => {
  const { editor } = useTiptap()

  return (
    <div className="floating-menu">
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}
      >
        H1
      </button>
    </div>
  )
}

export default () => {
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Heading,
      Bold,
      Collaboration.configure({
        document: ydoc,
      }),
      Placeholder.configure({
        placeholder: 'Write something … It’ll be shared with everyone else looking at this example.',
      }),
    ],
  })

  return (
    <Tiptap instance={editor}>
      <Tiptap.BubbleMenu>
        <BubbleMenuContent />
      </Tiptap.BubbleMenu>
      <Tiptap.FloatingMenu>
        <FloatingMenuContent />
      </Tiptap.FloatingMenu>
      <Tiptap.Content />
    </Tiptap>
  )
}
