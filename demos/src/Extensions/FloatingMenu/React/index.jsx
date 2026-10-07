import './styles.scss'

import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
import { FloatingMenu } from '@tiptap/react/menus'
import StarterKit from '@tiptap/starter-kit'
import React, { useEffect } from 'react'

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

  const { isHeading1, isHeading2, isBulletList } = useEditorState({
    editor,
    selector: ctx => ({
      isHeading1: ctx.editor.isActive('heading', { level: 1 }) ?? false,
      isHeading2: ctx.editor.isActive('heading', { level: 2 }) ?? false,
      isBulletList: ctx.editor.isActive('bulletList') ?? false,
    }),
  })

  return (
    <>
      <div className="control-group">
        <label>
          <input type="checkbox" checked={isEditable} onChange={() => setIsEditable(!isEditable)} />
          Editable
        </label>
      </div>
      {editor && (
        <FloatingMenu editor={editor}>
          <div className="floating-menu" data-testid="floating-menu">
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={isHeading1 ? 'is-active' : ''}
            >
              H1
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={isHeading2 ? 'is-active' : ''}
            >
              H2
            </button>
            <button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={isBulletList ? 'is-active' : ''}
            >
              Bullet list
            </button>
          </div>
        </FloatingMenu>
      )}
      <EditorContent editor={editor} />
    </>
  )
}
