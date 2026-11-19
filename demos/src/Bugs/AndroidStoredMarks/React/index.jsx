import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import React from 'react'

export default () => {
  const editor = useEditor({ extensions: [StarterKit], content: '<p></p>' })

  return (
    <>
      <div className="control-group">
        <div className="button-group">
          <button onClick={() => editor.chain().focus().toggleBold().run()}>Bold</button>
          <button onClick={() => editor.chain().focus().toggleItalic().run()}>Italic</button>
        </div>
      </div>
      <div className="output-group">
        With Android Gboard, type Prose, turn Bold on, type mirror, turn Bold off, then press Space.
        Repeat with another word. Formatting should apply only to characters typed after each
        toggle.
      </div>
      <EditorContent editor={editor} />
    </>
  )
}
