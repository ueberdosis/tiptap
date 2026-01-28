import './styles.scss'

import { findParentNode, posToDOMRect, useEditor, useTiptap, useTiptapState, Tiptap } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import React, { useEffect } from 'react'

const InlineBubbleMenuContent = () => {
  const { editor } = useTiptap()
  const { isBold, isItalic, isStrikethrough } = useTiptapState({
    selector: ctx => ({
      isBold: ctx.editor.isActive('bold'),
      isItalic: ctx.editor.isActive('italic'),
      isStrikethrough: ctx.editor.isActive('strike'),
    }),
  })

  return (
    <div className="bubble-menu">
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
    </div>
  )
}

const ListBubbleMenuContent = () => {
  const { editor } = useTiptap()

  return (
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
  )
}

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

      <Tiptap instance={editor}>
        {showMenu && (
          <>
            <Tiptap.BubbleMenu options={{ placement: 'bottom', offset: 8, flip: true }}>
              <InlineBubbleMenuContent />
            </Tiptap.BubbleMenu>

            <Tiptap.BubbleMenu
              shouldShow={(props) => props.editor.isActive('bulletList') || props.editor.isActive('orderedList')}
              getReferencedVirtualElement={(props) => {
                const parentNode = findParentNode(
                  node => node.type.name === 'bulletList' || node.type.name === 'orderedList',
                )(props.editor.state.selection)
                if (parentNode) {
                  const domRect = posToDOMRect(props.editor.view, parentNode.start, parentNode.start + parentNode.node.nodeSize)
                  return {
                    getBoundingClientRect: () => domRect,
                    getClientRects: () => [domRect],
                  }
                }
                return null
              }}
              options={{ placement: 'top-start', offset: 8 }}
            >
              <ListBubbleMenuContent />
            </Tiptap.BubbleMenu>
          </>
        )}
        <Tiptap.Content />
      </Tiptap>
    </>
  )
}
