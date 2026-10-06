import './styles.scss'

import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import React from 'react'

import DecorationsExtension from './Extension.js'

export default () => {
  const editor = useEditor({
    extensions: [StarterKit, DecorationsExtension],
    content: `
    <p>
      This demo shows that ProseMirror decorations update visually without React re-renders.
    </p>
    <decorations>
      Click the button below to toggle decorations. The render counter in the label
      stays the same — but the decorations (highlights) update immediately.
    </decorations>
    <p>
      ProseMirror manages the contentDOM natively. The React component only
      re-renders when the node reference or position actually changes.
    </p>
    `,
  })

  return <EditorContent editor={editor} />
}
