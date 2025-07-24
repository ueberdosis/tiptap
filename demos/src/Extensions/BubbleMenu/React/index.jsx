import './styles.scss'

import { EditorContent, useEditor } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'
import StarterKit from '@tiptap/starter-kit'
import React, { useEffect } from 'react'

/**
 * This demo shows how BubbleMenu now properly accepts style, className, and other HTML attributes
 * directly on the BubbleMenu component. These props are now applied to the actual bubble menu element
 * that gets positioned by the plugin, not just a child div.
 *
 * Previously, you would need to use a ref and useEffect to set styles like zIndex:
 *
 * const bubbleMenuRef = useRef(null)
 * useEffect(() => {
 *   if (bubbleMenuRef.current) {
 *     bubbleMenuRef.current.style.zIndex = "9999"
 *   }
 * }, [])
 *
 * Now you can simply pass the style prop directly:
 * <BubbleMenu style={{ zIndex: 9999 }} ... />
 */

export default () => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: `
      <p>
        Hey, try to select some text here. There will popup a menu for selecting some inline styles. Remember: you have full control about content and styling of this menu.
      </p>
    `,
  })

  const [showMenu, setShowMenu] = React.useState(true)
  const [isEditable, setIsEditable] = React.useState(true)

  useEffect(() => {
    if (editor) {
      editor.setEditable(isEditable)
    }
  }, [isEditable, editor])

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
          options={{ placement: 'bottom', offset: 8 }}
          className="bubble-menu"
          style={{
            zIndex: 9999,
            backgroundColor: 'var(--white)',
            border: '1px solid var(--gray-1)',
            borderRadius: '0.7rem',
            boxShadow: 'var(--shadow)',
            display: 'flex',
            padding: '0.2rem',
          }}
          data-testid="styled-bubble-menu"
        >
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? 'is-active' : ''}
          >
            Bold
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? 'is-active' : ''}
          >
            Italic
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={editor.isActive('strike') ? 'is-active' : ''}
          >
            Strike
          </button>
        </BubbleMenu>
      )}
      <EditorContent editor={editor} />
    </>
  )
}
