import './styles.scss'

import Document from '@tiptap/extension-document'
import Heading from '@tiptap/extension-heading'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { EditorContent, useEditor } from '@tiptap/react'
import React, { useState } from 'react'

const TiptapEditor = ({ count, editorClass }) => {
  const editor = useEditor({
    extensions: [
      Document,
      Heading,
      Paragraph,
      Text,
    ],
    editorProps: {
      attributes: {
        class: editorClass,
      },
    },
    onUpdate: () => {
      console.log(count)
    },
  }, [count, editorClass])

  if (!editor) {
    return null
  }

  return (
    <div>
      <EditorContent editor={editor} />
    </div>
  )
}

export default () => {
  const [count, setCount] = useState(0)
  const [editorClass, setEditorClass] = useState('my-editor')

  return (
    <>
      <button onClick={() => setCount(count + 1)}>Inc</button>
      <button onClick={() => setEditorClass('my-editor updated-editor')}>Update class</button>
      <TiptapEditor editorClass={editorClass} count={count} />
    </>
  )
}
