import React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import History from '@tiptap/extension-history'

export default () => {
  const editor = useEditor({
    extensions: [Document, Paragraph, Text, History],
    content: `
        <p>
          With the History extension the Editor will keep track of your changes. And if you think you made a mistake, you can redo your changes. Try it out, change the content and hit the undo button!
        </p>
        <p>
          And yes, you can also use a keyboard shortcut to undo changes (Control/Cmd Z) or redo changes (Control/Cmd Shift Z).
        </p>
      `,
  })

  if (!editor) {
    return null
  }

  return (
    <div>
      <button onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
        undo
      </button>
      <button onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
        redo
      </button>

      <EditorContent editor={editor} />
    </div>
  )
}
