import React from 'react'
import { useEditor, EditorContent, FloatingMenu } from '@tiptap/react'
import { defaultExtensions } from '@tiptap/starter-kit'
import './styles.scss'

export default () => {
  const editor = useEditor({
    extensions: [
      ...defaultExtensions(),
    ],
    content: `
      <p>
        This is an example of a Medium-like editor. Enter a new line and some buttons will appear.
      </p>
      <p></p>
    `,
  })

  return (
    <div style={{ position: 'relative' }}>
      {editor && <FloatingMenu editor={editor}>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}
        >
          h1
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
        >
          h2
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'is-active' : ''}
        >
          bullet list
        </button>
      </FloatingMenu>}
      <EditorContent editor={editor} />
    </div>
  )
}
