import { Editor } from '@tiptap/core'
import { useEditorState } from '@tiptap/react'
import React, { useEffect, useRef, useState } from 'react'

/**
 * Handles the heading dropdown
 */
export function NodeTypeDropdown({ editor }: { editor: Editor }) {
  const dropdownRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const { activeNodeType } = useEditorState({
    editor,
    selector: ctx => {
      const activeNode = ctx.editor.state.selection.$from.node(1)

      return {
        activeNodeType: activeNode?.type.name ?? 'paragraph',
      }
    },
  })

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [])

  return (
    <div className="node-type-dropdown__container" ref={menuRef}>
      <button
        onClick={() => {
          setIsOpen(open => !open)
        }}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setIsOpen(open => !open)
          }
        }}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-controls="heading-dropdown"
        className={`node-type-dropdown__trigger${
          isOpen ? ' is-active' : ''
        }`}
        tabIndex={-1}
      >
        Node Type: {activeNodeType.slice(0, 1).toUpperCase() + activeNodeType.slice(1)}
      </button>
      {isOpen && (
        <div
          ref={dropdownRef}
          id="node-type-dropdown"
          role="menu"
          className="node-type-dropdown__items"
        >
          <button
            onClick={() => {
              editor.chain().focus().setParagraph().run()

              setIsOpen(false)
            }}
            className={editor.isActive('paragraph') ? 'is-active' : ''}
            tabIndex={-1}
            role="menuitem"
            aria-label="Paragraph"
            // This is the first element in the dropdown, so if it loses focus, close the dropdown
            onBlur={e => {
              // Is it not within the dropdown?
              if (!dropdownRef.current?.contains(e.relatedTarget as Node)) {
                e.preventDefault()
                setIsOpen(false)
              }
            }}
          >
            Paragraph
          </button>
          {([1, 2, 3, 4, 5, 6] as const).map(level => (
            <button
              key={level}
              onClick={() => {
                editor.chain().focus().toggleHeading({ level }).run()
                setIsOpen(false)
              }}
              className={editor.isActive('heading', { level }) ? 'is-active' : ''}
              tabIndex={-1}
              role="menuitem"
              aria-label={`H${level}`}
            >
              H{level}
            </button>
          ))}
          <button
            onClick={() => {
              editor.chain().focus().toggleBulletList().run()

              setIsOpen(false)
            }}
            className={editor.isActive('bulletList') ? 'is-active' : ''}
            tabIndex={-1}
            role="menuitem"
            aria-label="Bullet list"
          >
            Bullet list
          </button>
          <button
            onClick={() => {
              editor.chain().focus().toggleOrderedList().run()

              setIsOpen(false)
            }}
            className={editor.isActive('orderedList') ? 'is-active' : ''}
            tabIndex={-1}
            role="menuitem"
            aria-label="Ordered List"
          >
            Ordered list
          </button>
          <button
            onClick={() => {
              editor.chain().focus().toggleCodeBlock().run()

              setIsOpen(false)
            }}
            className={editor.isActive('codeBlock') ? 'is-active' : ''}
            tabIndex={-1}
            role="menuitem"
            aria-label="Code block"
          >
            Code block
          </button>
          <button
            onClick={() => {
              editor.chain().focus().toggleBlockquote().run()

              setIsOpen(false)
            }}
            className={editor.isActive('blockquote') ? 'is-active' : ''}
            tabIndex={-1}
            role="menuitem"
            aria-label="Blockquote"
            // This is the last element, so if it loses focus, close the dropdown
            onBlur={e => {
              // Is it not within the dropdown?
              if (!dropdownRef.current?.contains(e.relatedTarget as Node)) {
                e.preventDefault()
                setIsOpen(false)
              }
            }}
          >
            Blockquote
          </button>
        </div>
      )}
    </div>
  )
}
