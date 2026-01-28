import './styles.scss'

import { useEditor, useTiptap, Tiptap } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import React from 'react'

const BubbleMenuContent = () => {
  const { editor } = useTiptap()

  return (
    <>
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive('bold') ? 'is-active' : ''}
      >
        Bold
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive('italic') ? 'is-active' : ''}
      >
        Italic
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={editor.isActive('strike') ? 'is-active' : ''}
      >
        Strike
      </button>
    </>
  )
}

const FloatingMenuContent = () => {
  const { editor } = useTiptap()

  return (
    <>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}
      >
        H1
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
      >
        H2
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive('bulletList') ? 'is-active' : ''}
      >
        Bullet list
      </button>
    </>
  )
}

export default () => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: `
      <p>
        Try to select <em>this text</em> to see what we call the bubble menu.
      </p>
      <p>
        Neat, isn’t it? Add an empty paragraph to see the floating menu.
      </p>
    `,
  })

  return (
    <Tiptap instance={editor}>
      <Tiptap.BubbleMenu className="bubble-menu">
        <BubbleMenuContent />
      </Tiptap.BubbleMenu>

      <Tiptap.FloatingMenu className="floating-menu">
        <FloatingMenuContent />
      </Tiptap.FloatingMenu>

      <Tiptap.Content />
    </Tiptap>
  )
}
