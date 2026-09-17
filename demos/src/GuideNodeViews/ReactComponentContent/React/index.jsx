import './styles.scss'

import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import React from 'react'

import ReactComponent from './Extension.js'

export default () => {
  const editor = useEditor({
    extensions: [StarterKit, ReactComponent],
    content: `
    <p>
      This is still the text editor you’re used to, but enriched with node views.
    </p>
    <react-component>This is editable. Press Enter to split the content, Shift+Enter for a line break, or Mod+Enter for a new component.</react-component>
    <p>
      Did you see that? That’s a React component. We are really living in the future.
    </p>
    `,
  })

  return <EditorContent editor={editor} />
}
