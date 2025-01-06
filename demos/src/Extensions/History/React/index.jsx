import './styles.scss'

import Document from '@tiptap/extension-document'
import History from '@tiptap/extension-history'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
import React from 'react'

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

  const { canUndo, canRedo } = useEditorState({
    editor,
    selector: ctx => {
      return {
        canUndo: ctx.editor.can().chain().focus().undo().run(),
        canRedo: ctx.editor.can().chain().focus().redo().run(),
      }
    },
  })

  if (!editor) {
    return null
  }

  return (
    <>
      <div className="control-group">
        <div className="button-group">
          <button onClick={() => editor.chain().focus().undo().run()} disabled={!canUndo}>
            Undo
          </button>
          <button onClick={() => editor.chain().focus().redo().run()} disabled={!canRedo}>
            Redo
          </button>
        </div>
      </div>

      <EditorContent editor={editor} />
    </>
  )
}
