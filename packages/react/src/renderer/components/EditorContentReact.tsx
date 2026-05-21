/** @jsxImportSource react */

/**
 * Mount point for the experimental React-native renderer.
 *
 * Drop-in replacement for `<EditorContent>` when
 * `experimentalReactRenderer` is on. Owns the DOM element PM mounts
 * into; renders the doc tree through `<DocNodeView>`; swaps PM's
 * docView for the React-built tree.
 */

import type { Editor } from '@tiptap/core'
import type { HTMLAttributes } from 'react'
import React, { useEffect, useRef, useState } from 'react'

import { useEditorState } from '../../useEditorState.js'
import type { ReactEditorView } from '../ReactEditorView.js'
import { DocNodeView } from './DocNodeView.js'

export interface EditorContentReactProps extends HTMLAttributes<HTMLDivElement> {
  editor: Editor | null
}

export function EditorContentReact({ editor, ...rest }: EditorContentReactProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  const attachedRef = useRef(false)

  // Mount the editor onto our React-owned div once both are ready.
  useEffect(() => {
    if (!editor || !mountRef.current || mounted) {
      return
    }
    editor.mount(mountRef.current)
    setMounted(true)
  }, [editor, mounted])

  // Subscribe to the live doc so React re-renders on every transaction.
  const doc = useEditorState({
    editor,
    selector: ({ editor: e }) => e?.state.doc ?? null,
  })

  return (
    <div ref={mountRef} {...rest}>
      {mounted && doc && (
        <DocNodeView
          doc={doc}
          onDocDesc={desc => {
            if (!desc || !editor || attachedRef.current) {
              return
            }
            ;(editor.view as ReactEditorView).attachReactRoot(desc)
            attachedRef.current = true
          }}
        />
      )}
    </div>
  )
}
