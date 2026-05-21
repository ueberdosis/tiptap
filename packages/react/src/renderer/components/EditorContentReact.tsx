/** @jsxImportSource react */

/**
 * Mount point for the experimental React-native renderer.
 *
 * Mounts PM directly onto the React-owned container (`{ mount }`
 * form so view.dom IS our React div, with no intermediate PM div).
 * Wipes PM's initial DOM render and lets `<DocNodeView>` paint the
 * content. `attachReactRoot` swaps PM's docView for the React tree.
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

/** Read the editor's private editorView field without going through the proxy. */
function getView(editor: Editor): ReactEditorView | null {
  return (editor as unknown as { editorView: ReactEditorView | null }).editorView
}

export function EditorContentReact({ editor, ...rest }: EditorContentReactProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)
  const attachedRef = useRef(false)

  useEffect(() => {
    if (!editor || !containerRef.current) {
      return
    }
    if (getView(editor)) {
      // Already mounted (HMR / re-effect).
      setReady(true)
      return
    }
    // Mount with `{ mount }` so PM uses our React-owned div AS view.dom
    // (no intermediate PM-owned wrapper element).
    editor.mount({ mount: containerRef.current } as unknown as HTMLElement)
    // PM just rendered the doc into view.dom. Wipe — React will paint.
    const view = getView(editor)
    if (view) {
      const internals = view as unknown as { domObserver: { start(): void; stop(): void } }
      internals.domObserver.stop()
      view.dom.replaceChildren()
      internals.domObserver.start()
    }
    setReady(true)
  }, [editor])

  const doc = useEditorState({
    editor,
    selector: ({ editor: e }) => e?.state.doc ?? null,
  })

  const view = editor ? getView(editor) : null

  return (
    <div ref={containerRef} {...rest}>
      {ready && doc && view && (
        <DocNodeView
          doc={doc}
          dom={view.dom}
          onDocDesc={desc => {
            if (!desc || attachedRef.current) {
              return
            }
            view.attachReactRoot(desc)
            attachedRef.current = true
          }}
        />
      )}
    </div>
  )
}
