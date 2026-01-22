import type { Editor } from '@dibdab/react'
import { useEditorState } from '@dibdab/react'
import { FloatingMenu } from '@dibdab/react/menus'
import React, { useRef } from 'react'

import { useMenubarNav } from './useMenubarNav.js'

/**
 * A floating menu for inserting new elements like lists, horizontal rules, etc.
 */
export function InsertMenu({ editor }: { editor: Editor }) {
  const containerRef = useRef<HTMLDivElement>(null)

  const { activeNodeType } = useEditorState({
    editor,
    selector: ctx => {
      const activeNode = ctx.editor.state.selection.$from.node(1)

      return {
        activeNodeType: activeNode?.type.name ?? 'paragraph',
      }
    },
  })

  // Handle arrow navigation within a menu bar container, and allow to escape to the editor
  const { getFocusableElements } = useMenubarNav({
    editor,
    ref: containerRef,
    onEscape: e => {
      e.preventDefault()
      // On escape, focus the editor
      editor.chain().focus().run()
    },
  })

  return (
    <FloatingMenu
      editor={editor}
      shouldShow={null}
      aria-orientation="horizontal"
      role="menubar"
      aria-label="Insert Element menu"
      className="floating-menu"
      // Types are broken here, since we import jsx from vue-2
      ref={containerRef as any}
      onFocus={e => {
        // The ref we have is to the container, not the menu itself
        if (containerRef.current === e.target?.parentNode) {
          // Focus the first enabled button-like when the menu bar is focused
          getFocusableElements()?.[0]?.focus()
        }
      }}
      tabIndex={0}
    >
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={activeNodeType === 'bulletList' ? 'is-active' : ''}
        aria-pressed={activeNodeType === 'bulletList'}
        aria-label="Bullet List"
        tabIndex={-1}
      >
        Bullet list
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={activeNodeType === 'orderedList' ? 'is-active' : ''}
        aria-pressed={activeNodeType === 'orderedList'}
        aria-label="Ordered List"
        tabIndex={-1}
      >
        Ordered List
      </button>
      <button
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        aria-label="Horizontal rule"
        tabIndex={-1}
      >
        Horizontal rule
      </button>
      <button onClick={() => editor.chain().focus().setHardBreak().run()} aria-label="Hard break" tabIndex={-1}>
        Hard break
      </button>
    </FloatingMenu>
  )
}
