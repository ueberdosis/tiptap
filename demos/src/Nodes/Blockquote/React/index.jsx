import React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Blockquote from '@tiptap/extension-blockquote'
import './styles.scss'

export default () => {
  const editor = useEditor({
    extensions: [Document, Paragraph, Text, Blockquote],
    content: `
          <blockquote>
            Nothing is impossible, the word itself says “I’m possible!”
          </blockquote>
          <p>Audrey Hepburn</p>
        `,
  })

  if (!editor) {
    return null
  }

  return (
    <div>
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={editor.isActive('blockquote') ? 'is-active' : ''}
      >
        toggleBlockquote
      </button>
      <button
        onClick={() => editor.chain().focus().setBlockquote().run()}
        disabled={editor.isActive('blockquote')}
      >
        setBlockquote
      </button>
      <button
        onClick={() => editor.chain().focus().unsetBlockquote().run()}
        disabled={!editor.isActive('blockquote')}
      >
        unsetBlockquote
      </button>

      <EditorContent editor={editor} />
    </div>
  )
}
