/** @jsxImportSource react */
import type { Editor } from '@tiptap/core'
import type { EditorState } from '@tiptap/pm/state'
import type { HTMLAttributes, ReactNode, RefObject } from 'react'
import { useCallback, useLayoutEffect, useMemo, useRef, useSyncExternalStore } from 'react'

import { DecorationSet } from '@tiptap/pm/view'

import { collectReactMarkViews, collectReactNodeViews } from '../collectExtensionViews.js'
import type { EditorContextValue } from '../contexts/EditorContext.js'
import { EditorContext } from '../contexts/EditorContext.js'
import type { RenderState } from '../contexts/ReactKeysContext.js'
import { ReactKeysContext } from '../contexts/ReactKeysContext.js'
import { viewDecorations } from '../decorations/viewDecorations.js'
import { runEditorEffects } from '../hooks/editorEffects.js'
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
  /** `null` renders a placeholder element (`useEditor` with `immediatelyRender: false`). */
  editor: Editor | null
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
 * `plugins/composition.ts` commits the composed text at `compositionend`
 * with `composing` already false, so its commit notifies immediately.
 */
const useEditorTransactionState = (editor: Editor): EditorState => {
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

/**
 * Which `EditorContent` currently renders each editor. One editor supports
 * one `EditorContent` at a time (its `view.dom` is a single element).
 */
const activeRenderers = new WeakMap<Editor, object>()

/** Mounts the editor on first commit and applies the staged state after every commit. */
const useCommitEffect = (editor: Editor, docDescRef: RefObject<NodeViewDesc | null>): void => {
  const rendererToken = useRef<object>({})

  useLayoutEffect(() => {
    const desc = docDescRef.current

    if (!desc) {
      return
    }
    // One editor, one EditorContent: a second renderer would leave the
    // first with a stale `view.dom`. Ownership is (re)claimed every commit
    // so the situation is loud whichever order the two commit in.
    const owner = activeRenderers.get(editor)

    if (owner && owner !== rendererToken.current) {
      console.error(
        '[tiptap warn]: This editor is already rendered by another EditorContent. ' +
          'An editor supports a single EditorContent at a time; the earlier one is now stale.',
      )
    }
    activeRenderers.set(editor, rendererToken.current)

    // The pre-mount `editor.view` is a Proxy stand-in, never a real view.
    // (`editor.isDestroyed` cannot distinguish destroyed from unmounted —
    // `extensionManager` is nulled by destroy(), so it can.)
    if (!(editor.view instanceof ReactEditorView)) {
      if (!editor.extensionManager) {
        throw new RangeError(
          '[tiptap error]: This editor has been destroyed and cannot be rendered. ' +
            'Create a new editor instance instead (useEditor recreates one automatically).',
        )
      }
      editor.mount(desc.dom as HTMLElement)
    }

    const view = editor.view

    if (view instanceof ReactEditorView) {
      view.setDocView(desc)
      view.commitPendingEffects()
      // User-registered commit effects (useEditorEffect) run last, once the
      // view carries the committed state and the DOM selection is synced
      runEditorEffects(editor)
    }
  })

  useLayoutEffect(
    () => () => {
      if (activeRenderers.get(editor) === rendererToken.current) {
        activeRenderers.delete(editor)
      }
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
 *
 * A `null` editor renders a plain placeholder element instead — the
 * `useEditor({ immediatelyRender: false })` first render. The two branches
 * are separate components so the editor branch's hooks mount fresh.
 */
export function EditorContent({ editor, ...props }: EditorContentProps): ReactNode {
  if (!editor) {
    const { nodeViews: _nodeViews, markViews: _markViews, ...divProps } = props

    return <div {...divProps} />
  }
  return <EditorContentWithEditor editor={editor} {...props} />
}

interface EditorContentWithEditorProps extends Omit<EditorContentProps, 'editor'> {
  editor: Editor
}

function EditorContentWithEditor({
  editor,
  nodeViews = NO_NODE_VIEWS,
  markViews = NO_MARK_VIEWS,
  className,
  ...props
}: EditorContentWithEditorProps): ReactNode {
  const state = useEditorTransactionState(editor)
  const editable = useEditorEditable(editor)
  const docDescRef = useRef<NodeViewDesc | null>(null)
  // Components registered through extensions' addNodeView()/addMarkView();
  // the props win on conflicts
  const resolvedNodeViews = useMemo(
    () => ({ ...collectReactNodeViews(editor), ...nodeViews }),
    [editor, nodeViews],
  )
  const resolvedMarkViews = useMemo(
    () => ({ ...collectReactMarkViews(editor), ...markViews }),
    [editor, markViews],
  )
  const contextValue = useMemo<EditorContextValue>(
    () => ({ editor, nodeViews: resolvedNodeViews, markViews: resolvedMarkViews }),
    [editor, resolvedNodeViews, resolvedMarkViews],
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

  // Stable ref for the per-render state: never changes identity, so it never
  // forces memoized subtrees to re-render (see ReactKeysContext)
  const renderStateRef = useRef<RenderState>({ keys: null, selection: null })

  renderStateRef.current = {
    keys: reactKeysPluginKey.getState(state) ?? null,
    selection: state.selection,
  }

  return (
    <EditorContext.Provider value={contextValue}>
      <ReactKeysContext.Provider value={renderStateRef}>
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
