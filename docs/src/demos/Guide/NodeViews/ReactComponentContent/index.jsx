import React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import { defaultExtensions } from '@tiptap/starter-kit'
import ReactComponent from './Extension.js'
import './styles.scss'

export default () => {
  const editor = useEditor({
    extensions: [
      ...defaultExtensions(),
      ReactComponent,
    ],
    content: `
    <p>
      This is still the text editor you’re used to, but enriched with node views.
    </p>
    <react-component>
      <p>This is editable.</p>
    </react-component>
    <p>
      Did you see that? That’s a React component. We are really living in the future.
    </p>
    `,
  })

  return (
    <EditorContent editor={editor} />
  )
}
