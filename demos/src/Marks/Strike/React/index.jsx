import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Strike from '@tiptap/extension-strike'
import Text from '@tiptap/extension-text'
import { EditorContent, useEditor } from '@tiptap/react'
import React from 'react'

export default () => {
  const editor = useEditor({
    extensions: [Document, Paragraph, Text, Strike],
    content: `
          <p>This isn’t striked through.</s></p>
          <p><s>But that’s striked through.</s></p>
          <p><del>And this.</del></p>
          <p><strike>This too.</strike></p>
          <p style="text-decoration: line-through">This as well.</p>
        `,
  })

  if (!editor) {
    return null
  }

  return (
    <>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={editor.isActive('strike') ? 'is-active' : ''}
      >
        toggleStrike
      </button>
      <button
        onClick={() => editor.chain().focus().setStrike().run()}
        disabled={editor.isActive('strike')}
      >
        setStrike
      </button>
      <button
        onClick={() => editor.chain().focus().unsetStrike().run()}
        disabled={!editor.isActive('strike')}
      >
        unsetStrike
      </button>

      <EditorContent editor={editor} />
    </>
  )
}
