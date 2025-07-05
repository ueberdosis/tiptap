import './styles.scss'

import { EditorContent, useEditor } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'
import StarterKit from '@tiptap/starter-kit'
import React, { useEffect,useRef } from 'react'

export default () => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: `
      <p>
        Select this text to see a bubble menu with custom styling applied directly to the bubble menu element.
        The zIndex and other styles should now work properly without needing a ref and useEffect.
      </p>
    `,
  })

  const bubbleMenuRef = useRef(null)

  // This useEffect should no longer be necessary with the fix
  useEffect(() => {
    if (bubbleMenuRef.current) {
      console.log('BubbleMenu ref element:', bubbleMenuRef.current)
      console.log('Element styles:', bubbleMenuRef.current.style)
      console.log('Element className:', bubbleMenuRef.current.className)
    }
  }, [])

  return (
    <>
      {editor && (
        <>
          {/* Test direct props application without ref/useEffect workaround */}
          <BubbleMenu
            editor={editor}
            style={{
              zIndex: 9999,
              backgroundColor: 'red',
              border: '2px solid blue',
              padding: '10px',
            }}
            className="custom-bubble-menu"
            data-testid="bubble-menu-test"
          >
            <div className="bubble-menu-content">
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
            </div>
          </BubbleMenu>

          {/* Test that ref forwarding still works */}
          <BubbleMenu
            ref={bubbleMenuRef}
            editor={editor}
            style={{
              zIndex: 8888,
              backgroundColor: 'green',
              border: '2px solid orange',
              marginTop: '40px',
            }}
            className="ref-bubble-menu"
          >
            <div className="bubble-menu-content">
              <button
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={editor.isActive('strike') ? 'is-active' : ''}
              >
                Strike
              </button>
            </div>
          </BubbleMenu>
        </>
      )}
      <EditorContent editor={editor} />
    </>
  )
}
