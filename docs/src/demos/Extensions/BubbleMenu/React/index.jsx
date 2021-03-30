import React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import { defaultExtensions } from '@tiptap/starter-kit'
import './styles.scss'

export default () => {
  const editor = useEditor({
    extensions: [
      ...defaultExtensions(),
    ],
    content: `
      <p>
        Hey, try to select some text here. There will popup a menu for selecting some inline styles. Remember: you have full control about content and styling of this menu.
      </p>
    `,
  })

  return (
    <div>
      <EditorContent editor={editor} />
    </div>
  )
}
