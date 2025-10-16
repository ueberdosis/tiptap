import './styles.scss'

import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'
import StarterKit from '@tiptap/starter-kit'
import React, { useEffect } from 'react'

export default () => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: `
      <p>
        Hey, try to select some text here. There will popup a menu for selecting some inline styles. Remember: you have full control about content and styling of this menu.
      </p>
      <ul>
        <li>Select any item to display a global menu</li>
        <li>Item 1</li>
        <li>Item 2</li>
        <li>Item 3</li>
        <li>Item 4</li>
      </ul>
    `,
  })

  const [showMenu, setShowMenu] = React.useState(true)
  const [isEditable, setIsEditable] = React.useState(true)

  useEffect(() => {
    if (editor) {
      editor.setEditable(isEditable)
    }
  }, [isEditable, editor])

  const { isBold, isItalic, isStrikethrough } = useEditorState({
    editor,
    selector: ctx => ({
      isBold: ctx.editor.isActive('bold'),
      isItalic: ctx.editor.isActive('italic'),
      isStrikethrough: ctx.editor.isActive('strike'),
    }),
  })

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setShowMenu(old => !old)
          editor.commands.focus()
        }}
      >
        Toggle menu
      </button>
      <div className="control-group">
        <label>
          <input type="checkbox" checked={isEditable} onChange={() => setIsEditable(!isEditable)} />
          Editable
        </label>
      </div>

      {editor && showMenu && (
        <BubbleMenu
          editor={editor}
          options={{ placement: 'bottom', offset: 8, flip: true }}
          className="bubble-menu"
          data-testid="styled-bubble-menu"
          style={{ zIndex: 9999 }}
        >
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={isBold ? 'is-active' : ''}
            type="button"
          >
            Bold
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={isItalic ? 'is-active' : ''}
            type="button"
          >
            Italic
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={isStrikethrough ? 'is-active' : ''}
            type="button"
          >
            Strike
          </button>
        </BubbleMenu>
      )}
      <EditorContent editor={editor} />
    </>
  )
}
