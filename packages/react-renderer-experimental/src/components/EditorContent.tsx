/** @jsxImportSource react */
import type { Editor } from '@tiptap/core'
import type { EditorState } from '@tiptap/pm/state'
import type { HTMLAttributes, ReactNode, RefObject } from 'react'
import { useCallback, useLayoutEffect, useMemo, useRef, useSyncExternalStore } from 'react'

import { DecorationSet } from '@tiptap/pm/view'

import type { EditorContextValue } from '../contexts/EditorContext.js'
import { EditorContext } from '../contexts/EditorContext.js'
import { ReactKeysContext } from '../contexts/ReactKeysContext.js'
import { viewDecorations } from '../decorations/viewDecorations.js'
import { reactKeysPluginKey } from '../plugins/reactKeys.js'
import { attributesToProps } from '../props.js'
import { ReactEditorView } from '../ReactEditorView.js'
import type { NodeViewDesc } from '../viewdesc.js'
import { DocView } from './DocView.js'
import type { MarkViewComponent } from './MarkViewComponentProps.js'
import type { NodeViewComponent } from './NodeViewComponentProps.js'

const NO_NODE_VIEWS: Record<string, NodeViewComponent> = {}
const NO_MARK_VIEWS: Record<string, MarkViewComponent> = {}

export interface EditorContentProps extends HTMLAttributes<HTMLDivElement> {
  editor: Editor
  /** React node view components by node type name. */
  nodeViews?: Record<string, NodeViewComponent>
  /** React mark view components by mark type name. */
  markViews?: Record<string, MarkViewComponent>
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
 * The document element's attributes, mirroring the base view's
 * `computeDocDeco` (which we bypass): the `ProseMirror` class the injected
 * editor CSS targets (`white-space: pre-wrap` and friends — without it,
 * spaces collapse and empty blocks misbehave), everything contributed
 * through the `attributes` prop by the editor and its plugins, and the
 * `translate="no"` default. The `tiptap` class is prepended by the Editor
 * itself after mounting, outside React.
 */
const computeDocAttributes = (editor: Editor): Record<string, string> => {
  const attrs: Record<string, string> = { class: 'ProseMirror' }
  const view = editor.view

  if (view instanceof ReactEditorView) {
    view.someProp('attributes', value => {
      const resolved = typeof value === 'function' ? value(view.state) : value

      if (!resolved) {
        return undefined
      }
      Object.entries(resolved).forEach(([name, attrValue]) => {
        if (name === 'class') {
          attrs.class += ` ${attrValue}`
        } else if (name === 'style') {
          attrs.style = attrs.style ? `${attrs.style};${attrValue}` : String(attrValue)
        } else if (!attrs[name] && name !== 'contenteditable' && name !== 'nodeName') {
          attrs[name] = String(attrValue)
        }
      })
      // Returning nothing keeps someProp collecting from every plugin
      return undefined
    })
  }
  if (!attrs.translate) {
    attrs.translate = 'no'
  }
  return attrs
}

/** Mounts the editor on first commit and applies the staged state after every commit. */
const useCommitEffect = (editor: Editor, docDescRef: RefObject<NodeViewDesc | null>): void => {
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
  markViews = NO_MARK_VIEWS,
  className,
  ...props
}: EditorContentProps): ReactNode {
  const state = useEditorState(editor)
  const editable = useEditorEditable(editor)
  const docDescRef = useRef<NodeViewDesc | null>(null)
  const contextValue = useMemo<EditorContextValue>(
    () => ({ editor, nodeViews, markViews }),
    [editor, nodeViews, markViews],
  )

  useCommitEffect(editor, docDescRef)

  const docProps = attributesToProps(computeDocAttributes(editor))
  const mergedClassName = [docProps.className, className].filter(Boolean).join(' ')
  // The decoration source for the rendered state: every plugin's
  // `decorations` prop. Computed against `state` (not `view.state`), which
  // can lag while a composition defers re-renders.
  const innerDeco =
    editor.view instanceof ReactEditorView
      ? viewDecorations(editor.view, state)
      : DecorationSet.empty

  return (
    <EditorContext.Provider value={contextValue}>
      <ReactKeysContext.Provider value={reactKeysPluginKey.getState(state) ?? null}>
        <DocView
          role="textbox"
          {...docProps}
          {...props}
          className={mergedClassName}
          node={state.doc}
          innerDeco={innerDeco}
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
