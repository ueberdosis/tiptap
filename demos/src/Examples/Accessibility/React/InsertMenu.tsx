import { Editor, FloatingMenu, useEditorState } from '@tiptap/react'
import React, { useRef } from 'react'

// import { useFocusMenubar } from './useFocusMenubar.js'

export function InsertMenu({ editor }: { editor: Editor }) {
  const containerRef = useRef<HTMLDivElement>(null)

  const editorState = useEditorState({
    editor,
    selector: ctx => {
      return {
      }
    },
  })

  // // Handle arrow navigation within a menu bar container, and allow to escape to the editor
  // useFocusMenubar({
  //   editor,
  //   ref: containerRef,
  //   onEscape: () => {
  //     // On escape, focus the editor & dismiss the menu by moving the selection to the end of the selection
  //     editor.chain().focus().command(({ tr }) => {
  //       tr.setSelection(Selection.near(tr.selection.$to))
  //       return true
  //     }).run()
  //   },
  // })

  return (
    <FloatingMenu
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
      TST
    </FloatingMenu>
  )
}
