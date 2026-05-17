import './styles.scss'

import Document from '@tiptap/editor/nodes/document'
import Image from '@tiptap/extension-image'
import Paragraph from '@tiptap/editor/nodes/paragraph'
import Text from '@tiptap/editor/nodes/text'
import { Dropcursor } from '@tiptap/editor/extensions/dropcursor'
import { EditorContent, useEditor } from '@tiptap/react'
import React from 'react'

export default () => {
  const editor = useEditor({
    extensions: [Document, Paragraph, Text, Image, Dropcursor],
    content: `
      <p>This is a basic example of implementing images. Drag to re-order.</p>
      <img src="https://placehold.co/600x400" />
      <img src="https://placehold.co/800x400" />
    `,
  })

  const addImage = () => {
    const url = window.prompt('URL')

    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  if (!editor) {
    return null
  }

  return (
    <>
      <div className="control-group">
        <div className="button-group">
          <button onClick={addImage}>Add image from URL</button>
        </div>
      </div>
      <EditorContent editor={editor} />
    </>
  )
}
