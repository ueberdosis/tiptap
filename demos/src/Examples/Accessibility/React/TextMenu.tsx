import { Selection } from '@tiptap/pm/state'
import { BubbleMenu, Editor, useEditorState } from '@tiptap/react'
import React, { useRef } from 'react'

import { useFocusMenubar } from './useFocusMenubar.js'

export function TextMenu({ editor }: { editor: Editor }) {
  const containerRef = useRef<HTMLDivElement>(null)

  const editorState = useEditorState({
    editor,
    selector: ctx => {
      return {
        isBold: ctx.editor.isActive('bold'),
        canBold: ctx.editor.can().chain().focus().toggleBold()
          .run(),
        isItalic: ctx.editor.isActive('italic'),
        canItalic: ctx.editor.can().chain().focus().toggleItalic()
          .run(),
        isStrike: ctx.editor.isActive('strike'),
        canStrike: ctx.editor.can().chain().focus().toggleStrike()
          .run(),
        isCode: ctx.editor.isActive('code'),
        canCode: ctx.editor.can().chain().focus().toggleCode()
          .run(),
        canClearMarks: ctx.editor.can().chain().focus().unsetAllMarks()
          .run(),
      }
    },
  })

  // Handle arrow navigation within a menu bar container, and allow to escape to the editor
  useFocusMenubar({
    editor,
    ref: containerRef,
    onEscape: () => {
      // On escape, focus the editor & dismiss the menu by moving the selection to the end of the selection
      editor.chain().focus().command(({ tr }) => {
        tr.setSelection(Selection.near(tr.selection.$to))
        return true
      }).run()
    },
  })

  return (
    <BubbleMenu
      editor={editor}
      shouldShow={null}
      aria-orientation="horizontal"
      role="menubar"
      // Types are broken here, since we import jsx from vue-2
      ref={containerRef as any}
      // This is a raw HTML element, so we can't use onFocus
      onfocus={() => {
        // Focus the first button when the menu bar is focused
        containerRef.current?.querySelector('button')?.focus()
      }}
      tabIndex={0}
    >
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editorState.canBold}
        className={editorState.isBold ? 'is-active' : ''}
        aria-label="Bold"
        tabIndex={-1}
      >
        Bold
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editorState.canItalic}
        className={editorState.isItalic ? 'is-active' : ''}
        aria-label="Italic"
        tabIndex={-1}
      >
        Italic
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editorState.canStrike}
        className={editorState.isStrike ? 'is-active' : ''}
        aria-label="Strikethrough"
        tabIndex={-1}
      >
        Strike
      </button>
      <button
        onClick={() => editor.chain().focus().toggleCode().run()}
        disabled={!editorState.canCode}
        className={editorState.isCode ? 'is-active' : ''}
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
