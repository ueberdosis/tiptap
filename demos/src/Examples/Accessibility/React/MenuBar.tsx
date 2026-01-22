import type { Editor } from '@dibdab/core'
import { useEditorState } from '@dibdab/react'
import React, { useEffect, useRef, useState } from 'react'

import { useMenubarNav } from './useMenubarNav.js'

/**
 * Handles the heading dropdown
 */
function NodeTypeDropdown({ editor }: { editor: Editor }) {
  const dropdownRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [isOpen, setIsOpen] = useState(false)

  const editorState = useEditorState({
    editor,
    selector: ctx => {
      const activeNode = ctx.editor.state.selection.$from.node(1)

      return {
        activeNodeType: activeNode?.type.name ?? 'paragraph',
        isParagraph: ctx.editor.isActive('paragraph'),
        isHeading1: ctx.editor.isActive('heading', { level: 1 }),
        isHeading2: ctx.editor.isActive('heading', { level: 2 }),
        isHeading3: ctx.editor.isActive('heading', { level: 3 }),
        isHeading4: ctx.editor.isActive('heading', { level: 4 }),
        isHeading5: ctx.editor.isActive('heading', { level: 5 }),
        isHeading6: ctx.editor.isActive('heading', { level: 6 }),
        isBulletList: ctx.editor.isActive('bulletList'),
        isOrderedList: ctx.editor.isActive('orderedList'),
        isCodeBlock: ctx.editor.isActive('codeBlock'),
        isBlockquote: ctx.editor.isActive('blockquote'),
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
    <div
      className="node-type-dropdown__container"
      ref={menuRef}
      onKeyDown={e => {
        // Escape or tab should close the dropdown if it's open
        if (isOpen && (e.key === 'Escape' || e.key === 'Tab')) {
          setIsOpen(false)
          if (e.key === 'Escape') {
            // Prevent the editor from handling the escape key
            e.preventDefault()
          }
        }
      }}
    >
      <button
        onClick={e => {
          setIsOpen(open => !open)
          e.stopPropagation()
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
        className={`node-type-dropdown__trigger${isOpen ? ' is-active' : ''}`}
        tabIndex={-1}
      >
        Node Type: {editorState.activeNodeType.slice(0, 1).toUpperCase() + editorState.activeNodeType.slice(1)}
      </button>
      {isOpen && (
        <div
          ref={dropdownRef}
          id="node-type-dropdown"
          role="menu"
          aria-orientation="vertical"
          className="node-type-dropdown__items"
        >
          <button
            onClick={() => {
              editor.chain().focus().setParagraph().run()
              setIsOpen(false)
            }}
            className={editorState.isParagraph ? 'is-active' : ''}
            tabIndex={-1}
            role="menuitem"
            aria-label="Paragraph"
            aria-pressed={editorState.isParagraph}
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
          <button
            onClick={() => {
              editor.chain().focus().toggleHeading({ level: 1 }).run()
              setIsOpen(false)
            }}
            className={editorState.isHeading1 ? 'is-active' : ''}
            aria-pressed={editorState.isHeading1}
            tabIndex={-1}
            role="menuitem"
            aria-label="H1"
          >
            H1
          </button>
          <button
            onClick={() => {
              editor.chain().focus().toggleHeading({ level: 2 }).run()
              setIsOpen(false)
            }}
            className={editorState.isHeading2 ? 'is-active' : ''}
            aria-pressed={editorState.isHeading2}
            tabIndex={-1}
            role="menuitem"
            aria-label="H2"
          >
            H2
          </button>
          <button
            onClick={() => {
              editor.chain().focus().toggleHeading({ level: 3 }).run()
              setIsOpen(false)
            }}
            className={editorState.isHeading3 ? 'is-active' : ''}
            aria-pressed={editorState.isHeading3}
            tabIndex={-1}
            role="menuitem"
            aria-label="H3"
          >
            H3
          </button>
          <button
            onClick={() => {
              editor.chain().focus().toggleHeading({ level: 4 }).run()
              setIsOpen(false)
            }}
            className={editorState.isHeading4 ? 'is-active' : ''}
            aria-pressed={editorState.isHeading4}
            tabIndex={-1}
            role="menuitem"
            aria-label="H4"
          >
            H4
          </button>
          <button
            onClick={() => {
              editor.chain().focus().toggleHeading({ level: 5 }).run()
              setIsOpen(false)
            }}
            className={editorState.isHeading5 ? 'is-active' : ''}
            aria-pressed={editorState.isHeading5}
            tabIndex={-1}
            role="menuitem"
            aria-label="H5"
          >
            H5
          </button>
          <button
            onClick={() => {
              editor.chain().focus().toggleHeading({ level: 6 }).run()
              setIsOpen(false)
            }}
            className={editorState.isHeading6 ? 'is-active' : ''}
            aria-pressed={editorState.isHeading6}
            tabIndex={-1}
            role="menuitem"
            aria-label="H6"
          >
            H6
          </button>
          <button
            onClick={() => {
              editor.chain().focus().toggleBulletList().run()
              setIsOpen(false)
            }}
            className={editorState.isBulletList ? 'is-active' : ''}
            aria-pressed={editorState.isBulletList}
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
            className={editorState.isOrderedList ? 'is-active' : ''}
            aria-pressed={editorState.isOrderedList}
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
            className={editorState.isCodeBlock ? 'is-active' : ''}
            aria-pressed={editorState.isCodeBlock}
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
            className={editorState.isBlockquote ? 'is-active' : ''}
            aria-pressed={editorState.isBlockquote}
            tabIndex={-1}
            role="menuitem"
            aria-label="Blockquote"
            onBlur={e => {
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

/**
 * An accessible static top menu bar for the editor
 */
export function MenuBar({ editor }: { editor: Editor }) {
  const containerRef = useRef<HTMLDivElement>(null)

  const editorState = useEditorState({
    editor,
    selector: ctx => {
      return {
        canUndo: ctx.editor.can().chain().focus().undo().run(),
        canRedo: ctx.editor.can().chain().focus().redo().run(),
      }
    },
  })

  useMenubarNav({
    ref: containerRef,
    editor,
    onKeydown: event => {
      // Handle focus on alt + f10
      if (event.altKey && event.key === 'F10') {
        event.preventDefault()
        containerRef.current?.querySelector('button')?.focus()
      }
    },
  })

  if (!editor) {
    return null
  }

  return (
    <div
      className="control-group"
      role="toolbar"
      aria-orientation="horizontal"
      aria-keyshortcuts="Alt+F10"
      ref={containerRef}
    >
      <div className="button-group">
        <NodeTypeDropdown editor={editor} />
        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editorState.canUndo}
          tabIndex={-1}
          aria-label="Undo"
        >
          Undo
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editorState.canRedo}
          tabIndex={-1}
          aria-label="Redo"
        >
          Redo
        </button>
      </div>
    </div>
  )
}
