import './styles.scss'

import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { Dropcursor } from '@tiptap/extensions'
import { EditorContent, useEditor } from '@tiptap/react'
import { useCallback } from 'react'

import { CustomImage } from './CustomImage.js'
import { CustomImageView } from './CustomImageView.jsx'

export default () => {
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      CustomImage.extend({
        addNodeView() {
          return CustomImageView
        },
      }),
      Dropcursor,
    ],
    content: `
      <p>This is a basic example of implementing images. Drag to re-order.</p>
      <img src="https://placehold.co/600x400" />
      <img src="https://placehold.co/800x400" />
    `,
  })

  const addImage = useCallback(() => {
    const url = window.prompt('URL')
    if (url) {
      editor.chain().focus().setImage({ src: url, showCaption: false }).run()
    }
  }, [editor])

  const addImageWithCaption = useCallback(() => {
    const url = window.prompt('URL')
    if (url) {
      editor.chain().focus().setImage({ src: url, showCaption: true }).run()
    }
  }, [editor])

  if (!editor) {
    return null
  }

  return (
    <>
      <div className="control-group">
        <div className="button-group">
          <button onClick={addImage}>Set image (no caption)</button>
          <button onClick={addImageWithCaption}>Set image (with caption)</button>
        </div>
      </div>
      <EditorContent editor={editor} />
    </>
  )
}
