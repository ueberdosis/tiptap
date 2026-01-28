import './styles.scss'

import { useEditor, useTiptap, Tiptap } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import React, { useEffect } from 'react'

const FloatingMenuContent = () => {
  const { editor } = useTiptap()

  return (
    <div className="floating-menu" data-testid="floating-menu">
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
    </div>
  )
}

export default () => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: `
      <p>
        This is an example of a Medium-like editor. Enter a new line and some buttons will appear.
      </p>
      <p></p>
    `,
  })

  const [isEditable, setIsEditable] = React.useState(true)

  useEffect(() => {
    if (editor) {
      editor.setEditable(isEditable)
    }
  }, [isEditable, editor])

  return (
    <>
      <div className="control-group">
        <label>
          <input type="checkbox" checked={isEditable} onChange={() => setIsEditable(!isEditable)} />
          Editable
        </label>
      </div>
      <Tiptap instance={editor}>
        <Tiptap.FloatingMenu>
          <FloatingMenuContent />
        </Tiptap.FloatingMenu>
        <Tiptap.Content />
      </Tiptap>
    </>
  )
}
