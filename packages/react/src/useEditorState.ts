import type { Editor } from '@tiptap/core'
import { deepEqual } from 'fast-equals'
import { useCallback, useDebugValue, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useSyncExternalStoreWithSelector } from 'use-sync-external-store/shim/with-selector.js'

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

type CachedSelectedState<TSelectorResult> = { stored: false } | { stored: true; value: TSelectorResult }

function isCachedSelectedStateStored<TSelectorResult>(
  cache: CachedSelectedState<TSelectorResult>,
): cache is { stored: true; value: TSelectorResult } {
  return cache.stored
}

export type EditorStateSnapshot<TEditor extends Editor | null = Editor | null> = {
  editor: TEditor
  transactionNumber: number
}

export type UseEditorStateOptions<TSelectorResult, TEditor extends Editor | null = Editor | null> = {
  /**
   * The editor instance.
   */
  editor: TEditor
  /**
   * A selector function to determine the value to compare for re-rendering.
   *
   * When the editor snapshot is briefly `null`, this function is not called. If a
   * previous selection was cached, the last successful result is returned instead.
   */
  selector: (context: EditorStateSnapshot<TEditor>) => TSelectorResult
  /**
   * A custom equality function to determine if the editor should re-render.
   * @default `deepEqual` from `fast-deep-equal`
   */
  equalityFn?: (a: TSelectorResult, b: TSelectorResult | null) => boolean
}

/**
 * To synchronize the editor instance with the component state,
 * we need to create a separate instance that is not affected by the component re-renders.
 */
class EditorStateManager<TEditor extends Editor | null = Editor | null> {
  private transactionNumber = 0

  private lastTransactionNumber = 0

  private lastSnapshot: EditorStateSnapshot<TEditor>

  private editor: TEditor

  private subscribers = new Set<() => void>()

  constructor(initialEditor: TEditor) {
    this.editor = initialEditor
    this.lastSnapshot = { editor: initialEditor, transactionNumber: 0 }

    this.getSnapshot = this.getSnapshot.bind(this)
    this.getServerSnapshot = this.getServerSnapshot.bind(this)
    this.watch = this.watch.bind(this)
    this.subscribe = this.subscribe.bind(this)
  }

  /**
   * Get the current editor instance.
   */
  getSnapshot(): EditorStateSnapshot<TEditor> {
    if (this.transactionNumber === this.lastTransactionNumber) {
      return this.lastSnapshot
    }
    this.lastTransactionNumber = this.transactionNumber
    this.lastSnapshot = { editor: this.editor, transactionNumber: this.transactionNumber }
    return this.lastSnapshot
  }

  /**
   * Always disable the editor on the server-side.
   */
  getServerSnapshot(): EditorStateSnapshot<null> {
    return { editor: null, transactionNumber: 0 }
  }

  /**
   * Subscribe to the editor instance's changes.
   */
  subscribe(callback: () => void): () => void {
    this.subscribers.add(callback)
    return () => {
      this.subscribers.delete(callback)
    }
  }

  /**
   * Watch the editor instance for changes.
   */
  watch(nextEditor: Editor | null): undefined | (() => void) {
    this.editor = nextEditor as TEditor

    if (this.editor) {
      /**
       * This will force a re-render when the editor state changes.
       * This is to support things like `editor.can().toggleBold()` in components that `useEditor`.
       * This could be more efficient, but it's a good trade-off for now.
       */
      const fn = () => {
        this.transactionNumber += 1
        this.subscribers.forEach(callback => callback())
      }

      const currentEditor = this.editor

      currentEditor.on('transaction', fn)
      return () => {
        currentEditor.off('transaction', fn)
      }
    }

    return undefined
  }
}

/**
 * This hook allows you to watch for changes on the editor instance.
 * It will allow you to select a part of the editor state and re-render the component when it changes.
 * @example
 * ```tsx
 * const editor = useEditor({...options})
 * const { currentSelection } = useEditorState({
 *  editor,
 *  selector: snapshot => ({ currentSelection: snapshot.editor.state.selection }),
 * })
 */
export function useEditorState<TSelectorResult>(
  options: UseEditorStateOptions<TSelectorResult, Editor>,
): TSelectorResult
/**
 * This hook allows you to watch for changes on the editor instance.
 * It will allow you to select a part of the editor state and re-render the component when it changes.
 * @example
 * ```tsx
 * const editor = useEditor({...options})
 * const { currentSelection } = useEditorState({
 *  editor,
 *  selector: snapshot => ({ currentSelection: snapshot.editor.state.selection }),
 * })
 */
export function useEditorState<TSelectorResult>(
  options: UseEditorStateOptions<TSelectorResult, Editor | null>,
): TSelectorResult | null

/**
 * This hook allows you to watch for changes on the editor instance.
 * It will allow you to select a part of the editor state and re-render the component when it changes.
 *
 * @remarks When the editor snapshot is briefly `null` (for example during React StrictMode
 * remounts), the `selector` is not called. If a previous selection exists, the last successful
 * result is returned instead. This can surface a briefly stale value until the editor is
 * available again. If no selection was cached yet, `null` is returned.
 *
 * @example
 * ```tsx
 * const editor = useEditor({...options})
 * const { currentSelection } = useEditorState({
 *  editor,
 *  selector: snapshot => ({ currentSelection: snapshot.editor.state.selection }),
 * })
 */
export function useEditorState<TSelectorResult>(
  options: UseEditorStateOptions<TSelectorResult, Editor> | UseEditorStateOptions<TSelectorResult, Editor | null>,
): TSelectorResult | null {
  const [editorStateManager] = useState(() => new EditorStateManager(options.editor))
  const lastSelectedStateRef = useRef<CachedSelectedState<TSelectorResult>>({ stored: false })

  const selector = useCallback(
    (snapshot: EditorStateSnapshot<Editor | null>) => {
      if (snapshot.editor === null) {
        if (isCachedSelectedStateStored(lastSelectedStateRef.current)) {
          return lastSelectedStateRef.current.value
        }

        return null
      }

      const result = options.selector(snapshot as EditorStateSnapshot<Editor>)
      lastSelectedStateRef.current = { stored: true, value: result }

      return result
    },
    [options.selector],
  )

  const equalityFn = useCallback(
    (a: TSelectorResult | null, b: TSelectorResult | null) => {
      if (a === null) {
        return a === b
      }
      return (options.equalityFn ?? deepEqual)(a, b)
    },
    [options.equalityFn],
  )

  // Using the `useSyncExternalStore` hook to sync the editor instance with the component state
  const selectedState = useSyncExternalStoreWithSelector(
    editorStateManager.subscribe,
    editorStateManager.getSnapshot,
    editorStateManager.getServerSnapshot,
    selector,
    equalityFn,
  )

  useIsomorphicLayoutEffect(() => {
    return editorStateManager.watch(options.editor)
  }, [options.editor, editorStateManager])

  useDebugValue(selectedState)

  return selectedState
}
