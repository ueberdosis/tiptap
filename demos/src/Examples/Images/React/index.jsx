import React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Image from '@tiptap/extension-image'
import Dropcursor from '@tiptap/extension-dropcursor'
import './styles.scss'

export default () => {
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Image,
      Dropcursor,
    ],
    content: `
      <p>This is a basic example of implementing images. Drag to re-order.</p>
      <img src="https://source.unsplash.com/8xznAGy4HcY/800x400" />
      <img src="https://source.unsplash.com/K9QHL52rE2k/800x400" />
    `,
  })

  const addImage = () => {
    const url = window.prompt('URL')

    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  return (
    <div>
      <button onClick={addImage}>
        add image from URL
      </button>
      <EditorContent editor={editor} />
    </div>
  )
}
