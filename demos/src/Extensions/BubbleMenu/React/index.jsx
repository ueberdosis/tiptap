import './styles.scss'

import { EditorContent, findParentNode, posToDOMRect, useEditor } from '@tiptap/react'
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
        <>
          <BubbleMenu editor={editor} options={{ placement: 'bottom', offset: 8, flip: true }}>
            <div className="bubble-menu">
              <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={editor.isActive('bold') ? 'is-active' : ''}
                type="button"
              >
                Bold
              </button>
              <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={editor.isActive('italic') ? 'is-active' : ''}
                type="button"
              >
                Italic
              </button>
              <button
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={editor.isActive('strike') ? 'is-active' : ''}
                type="button"
              >
                Strike
              </button>
            </div>
          </BubbleMenu>

          <BubbleMenu
            editor={editor}
            shouldShow={() => editor.isActive('bulletList') || editor.isActive('orderedList')}
            getReferencedVirtualElement={() => {
              const parentNode = findParentNode(
                node => node.type.name === 'bulletList' || node.type.name === 'orderedList',
              )(editor.state.selection)
              if (parentNode) {
                const domRect = posToDOMRect(editor.view, parentNode.start, parentNode.start + parentNode.node.nodeSize)
                return {
                  getBoundingClientRect: () => domRect,
                  getClientRects: () => [domRect],
                }
              }
              return null
            }}
            options={{ placement: 'top-start', offset: 8 }}
          >
            <div className="bubble-menu">
              <button
                onClick={() => {
                  const chain = editor.chain().focus()
                  if (editor.isActive('bulletList')) {
                    chain.toggleOrderedList()
                  } else {
                    chain.toggleBulletList()
                  }
                  chain.run()
                }}
                type="button"
              >
                Toggle list type
              </button>
            </div>
          </BubbleMenu>
        </>
      )}
      <EditorContent editor={editor} />
    </>
  )
}
