import './styles.scss'

import Document from '@tiptap/extension-document'
import Image from '@tiptap/extension-image'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { Dropcursor } from '@tiptap/extensions'
import { EditorContent, useReactEditor } from '@tiptap/react-renderer-experimental'
import React, { useCallback } from 'react'

import Component from './Component.jsx'

export default () => {
  const editor = useReactEditor({
    extensions: [Document, Paragraph, Text, Image, Dropcursor],
    content: `
        <p>
          This is the resizable images demo under the experimental React
          renderer: resizing is implemented by a plain React component
          (drag the corner handle), not by an imperative node view.
        </p>
        <img src="https://placehold.co/600x400" />
        <img src="https://placehold.co/800x400" />
      `,
  })

  const addImage = useCallback(() => {
    const url = window.prompt('URL')

    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }, [editor])

  return (
    <>
      <div className="control-group">
        <div className="button-group">
          <button onClick={addImage}>Set image</button>
        </div>
      </div>
      <EditorContent editor={editor} nodeViews={{ image: Component }} />
    </>
  )
}
