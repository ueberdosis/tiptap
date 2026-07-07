/** @jsxImportSource react */
import type { Editor } from '@tiptap/core'
import type { EditorState } from '@tiptap/pm/state'
import type { HTMLAttributes, ReactNode } from 'react'
import { useCallback, useLayoutEffect, useMemo, useRef, useSyncExternalStore } from 'react'

import type { EditorContextValue } from '../contexts/EditorContext.js'
import { EditorContext } from '../contexts/EditorContext.js'
import { ReactKeysContext } from '../contexts/ReactKeysContext.js'
import { reactKeysPluginKey } from '../plugins/reactKeys.js'
import { ReactEditorView } from '../ReactEditorView.js'
import type { NodeViewDesc } from '../viewdesc.js'
import { DocView } from './DocView.js'
import type { NodeViewComponent } from './NodeViewComponentProps.js'

const NO_NODE_VIEWS: Record<string, NodeViewComponent> = {}

export interface EditorContentProps extends HTMLAttributes<HTMLDivElement> {
  editor: Editor
  /** React node view components by node type name. */
  nodeViews?: Record<string, NodeViewComponent>
}

/**
 * Subscribes to the editor's transactions. Re-renders are deferred while an
 * IME composition is active (the browser owns the DOM then; React writing to
 * the composing text node would cancel the composition) and forced on
 * `compositionend` so React catches up even when ProseMirror dispatches no
 * further transaction. The snapshot freezes during composition too, so a
 * parent-triggered re-render cannot smuggle the new state past the deferral.
 */
const useEditorState = (editor: Editor): EditorState => {
  const subscribe = useCallback(
    (notify: () => void) => {
      let composingDOM: HTMLElement | null = null
      // Stable reference: re-adding the same listener with `once` never stacks
      const onCompositionEnd = () => notify()
      const onTransaction = () => {
        const view = editor.view

        if (view.composing) {
          composingDOM = view.dom
          view.dom.addEventListener('compositionend', onCompositionEnd, { once: true })
          return
        }
        notify()
      }

      editor.on('transaction', onTransaction)
      return () => {
        editor.off('transaction', onTransaction)
        composingDOM?.removeEventListener('compositionend', onCompositionEnd)
      }
    },
    [editor],
  )

  const frozenState = useRef(editor.state)
  const getSnapshot = useCallback(() => {
    if (!editor.view.composing) {
      frozenState.current = editor.state
    }
    return frozenState.current
  }, [editor])

  return useSyncExternalStore(subscribe, getSnapshot, () => editor.state)
}

/**
 * Tracks `editor.isEditable`. `setEditable()` emits `update` without
 * dispatching a transaction, so it needs its own subscription.
 */
const useEditorEditable = (editor: Editor): boolean => {
  const subscribe = useCallback(
    (notify: () => void) => {
      editor.on('update', notify)
      return () => {
        editor.off('update', notify)
      }
    },
    [editor],
  )

  return useSyncExternalStore(
    subscribe,
    () => editor.isEditable,
    () => editor.isEditable,
  )
}

/**
 * Renders the editor's document with React-owned DOM. Mounts the editor onto
 * the rendered document element on first commit; after every commit it hands
 * the refreshed doc desc to the view and applies the staged state
 * (`commitPendingEffects`), which updates plugin views and syncs the DOM
 * selection. There is no `flushSync` anywhere on this path.
 */
export function EditorContent({
  editor,
  nodeViews = NO_NODE_VIEWS,
  ...props
}: EditorContentProps): ReactNode {
  const state = useEditorState(editor)
  const editable = useEditorEditable(editor)
  const docDescRef = useRef<NodeViewDesc | null>(null)
  const contextValue = useMemo<EditorContextValue>(
    () => ({ editor, nodeViews }),
    [editor, nodeViews],
  )

  useLayoutEffect(() => {
    const desc = docDescRef.current

    if (!desc) {
      return
    }
    // The pre-mount `editor.view` is a Proxy stand-in, never a real view.
    // A destroyed editor looks unmounted too and would crash here; keeping
    // a destroyed editor rendered is a consumer error (StrictMode-safe
    // lifecycle handling lands with the Phase 9 hook hardening).
    if (!(editor.view instanceof ReactEditorView)) {
      editor.mount(desc.dom as HTMLElement)
    }

    const view = editor.view

    if (view instanceof ReactEditorView) {
      view.setDocView(desc)
      view.commitPendingEffects()
    }
  })

  useLayoutEffect(
    () => () => {
      if (editor.view instanceof ReactEditorView) {
        editor.unmount()
      }
    },
    [editor],
  )

  return (
    <EditorContext.Provider value={contextValue}>
      <ReactKeysContext.Provider value={reactKeysPluginKey.getState(state) ?? null}>
        <DocView
          role="textbox"
          {...props}
          node={state.doc}
          contentEditable={editable}
          suppressContentEditableWarning
          onDocDesc={desc => {
            docDescRef.current = desc
          }}
        />
      </ReactKeysContext.Provider>
    </EditorContext.Provider>
  )
}
