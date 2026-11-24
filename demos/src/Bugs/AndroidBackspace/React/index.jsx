import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import React from 'react'

export default () => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: '<p>First paragraph</p><p>Second paragraph</p>',
  })

  return (
    <>
      <div className="output-group">
        On Android, focus a paragraph and immediately press Backspace. The last character should
        disappear and typing should continue normally.
      </div>
      <EditorContent editor={editor} />
    </>
  )
}
