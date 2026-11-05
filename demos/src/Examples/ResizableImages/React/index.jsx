import './styles.scss'

import Document from '@tiptap/extension-document'
import Image from '@tiptap/extension-image'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { Dropcursor, UndoRedo } from '@tiptap/extensions'
import { EditorContent, useEditor } from '@tiptap/react'

export default () => {
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Image.configure({
        resize: {
          enabled: true,
          alwaysPreserveAspectRatio: true,
        },
      }),
      Dropcursor,
      UndoRedo,
    ],
    content: `
        <p>Resize an image, then undo or redo to restore its dimensions.</p>
        <img src="https://placehold.co/600x400" />
        <img src="https://placehold.co/800x400" />
      `,
  })

  if (!editor) {
    return null
  }

  return (
    <>
      <div className="control-group">
        <div className="button-group">
          <button
            onClick={() => {
              const src = window.prompt('Image URL')
              if (src) {
                editor.chain().focus().setImage({ src }).run()
              }
            }}
          >
            Set image
          </button>
          <button
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
          >
            Undo
          </button>
          <button
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
          >
            Redo
          </button>
        </div>
      </div>
      <EditorContent editor={editor} />
    </>
  )
}
