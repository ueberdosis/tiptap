import { Selection } from '@dibdab/pm/state'
import type { Editor } from '@dibdab/react'
import { useEditorState } from '@dibdab/react'
import { BubbleMenu } from '@dibdab/react/menus'
import React, { useRef } from 'react'

import { useMenubarNav } from './useMenubarNav.js'

/**
 * Handles formatting text with marks like bold, italic, etc.
 */
export function TextMenu({ editor }: { editor: Editor }) {
  const containerRef = useRef<HTMLDivElement>(null)

  const editorState = useEditorState({
    editor,
    selector: ctx => {
      return {
        isBold: ctx.editor.isActive('bold'),
        canBold: ctx.editor.can().chain().focus().toggleBold().run(),
        isItalic: ctx.editor.isActive('italic'),
        canItalic: ctx.editor.can().chain().focus().toggleItalic().run(),
        isStrike: ctx.editor.isActive('strike'),
        canStrike: ctx.editor.can().chain().focus().toggleStrike().run(),
        isCode: ctx.editor.isActive('code'),
        canCode: ctx.editor.can().chain().focus().toggleCode().run(),
        canClearMarks: ctx.editor.can().chain().focus().unsetAllMarks().run(),
      }
    },
  })

  // Handle arrow navigation within a menu bar container, and allow to escape to the editor
  const { getFocusableElements } = useMenubarNav({
    editor,
    ref: containerRef,
    onEscape: e => {
      e.preventDefault()
      // On escape, focus the editor & dismiss the menu by moving the selection to the end of the selection
      editor
        .chain()
        .focus()
        .command(({ tr }) => {
          tr.setSelection(Selection.near(tr.selection.$to))
          return true
        })
        .run()
    },
  })

  return (
    <BubbleMenu
      editor={editor}
      shouldShow={null}
      aria-label="Text formatting menu"
      aria-orientation="horizontal"
      role="menubar"
      className="bubble-menu"
      // Types are broken here, since we import jsx from vue-2
      ref={containerRef as any}
      onFocus={e => {
        // The ref we have is to the container, not the menu itself
        if (containerRef.current === e.target?.parentNode) {
          // Focus the first button when the menu bar is focused
          getFocusableElements()?.[0]?.focus()
        }
      }}
      tabIndex={0}
    >
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editorState.canBold}
        className={editorState.isBold ? 'is-active' : ''}
        aria-pressed={editorState.isBold}
        aria-label="Bold"
        tabIndex={-1}
      >
        Bold
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editorState.canItalic}
        className={editorState.isItalic ? 'is-active' : ''}
        aria-pressed={editorState.isItalic}
        aria-label="Italic"
        tabIndex={-1}
      >
        Italic
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editorState.canStrike}
        className={editorState.isStrike ? 'is-active' : ''}
        aria-pressed={editorState.isStrike}
        tabIndex={-1}
      >
        Strike
      </button>
      <button
        onClick={() => editor.chain().focus().toggleCode().run()}
        disabled={!editorState.canCode}
        className={editorState.isCode ? 'is-active' : ''}
        aria-pressed={editorState.isCode}
        aria-label="Code"
        tabIndex={-1}
      >
        Code
      </button>
      <button
        disabled={!editorState.canClearMarks}
        onClick={() => editor.chain().focus().unsetAllMarks().run()}
        aria-label="Clear Marks"
        tabIndex={-1}
      >
        Clear marks
      </button>
    </BubbleMenu>
  )
}
