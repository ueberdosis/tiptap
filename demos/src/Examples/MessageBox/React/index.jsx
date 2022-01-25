import React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Bold from '@tiptap/extension-bold'
import Italic from '@tiptap/extension-italic'
import Strike from '@tiptap/extension-strike'
import Placeholder from '@tiptap/extension-placeholder'
import { content } from '../content'
import './styles.scss'

const TextFormattingMenu = ({ editor }) => {
  if (!editor) {
    return null
  }

  return (
    <nav>
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive('bold') ? 'is-active' : ''}
      >
        bold
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive('italic') ? 'is-active' : ''}
      >
        italic
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={editor.isActive('strike') ? 'is-active' : ''}
      >
        strike
      </button>
      <div className="divider"></div>
    </nav>
  )
}

export default () => {
  const limit = 280

  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Bold,
      Italic,
      Strike,
      Placeholder,
    ],
    content,
  })

  return (
    <div className='message-box'>
      <header>
        <TextFormattingMenu editor={editor} />
      </header>
      <main>
        <EditorContent editor={editor} />
      </main>
      <footer></footer>
    </div>
  )
}
