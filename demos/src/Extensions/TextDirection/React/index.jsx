import './styles.scss'

import Document from '@tiptap/extension-document'
import Heading from '@tiptap/extension-heading'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import TextDirection from '@tiptap/extension-text-direction'
import { EditorContent, useEditor } from '@tiptap/react'
import React from 'react'

export default () => {
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Heading,
      TextDirection.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: `
        <h2 dir="ltr">Heading</h2>
        <h2 dir="rtl">عنوان</h2>
        <p id="ltr-text" dir="ltr">first paragraph</p>
        <p id="rtl-text" dir="rtl">پاراگراف دوم</p>
      `,
  })

  if (!editor) {
    return null
  }

  return (
    <div>
      <button
        onClick={() => editor.chain().focus().setTextDirection('ltr').run()}
        className={editor.isActive({ dir: 'ltr' }) ? 'is-active' : ''}
      >
        ltr
      </button>
      <button
        onClick={() => editor.chain().focus().setTextDirection('rtl').run()}
        className={editor.isActive({ dir: 'rtl' }) ? 'is-active' : ''}
      >
        rtl
      </button>
      <EditorContent editor={editor} />
    </div>
  )
}
