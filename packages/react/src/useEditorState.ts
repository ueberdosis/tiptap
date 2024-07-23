import { useDebugValue, useEffect, useState } from 'react'
import { useSyncExternalStoreWithSelector } from 'use-sync-external-store/shim/with-selector'

import type { Editor } from './Editor.js'

export type EditorStateSnapshot<TEditor extends Editor | null = Editor | null> = {
  editor: TEditor;
  transactionNumber: number;
};
export type UseEditorStateOptions<
  TSelectorResult,
  TEditor extends Editor | null = Editor | null,
> = {
  /**
   * The editor instance.
   */
  editor: TEditor;
  /**
   * A selector function to determine the value to compare for re-rendering.
   */
  selector: (context: EditorStateSnapshot<TEditor>) => TSelectorResult;
  /**
   * A custom equality function to determine if the editor should re-render.
   * @default `(a, b) => a === b`
   */
  equalityFn?: (a: TSelectorResult, b: TSelectorResult | null) => boolean;
};

/**
 * To synchronize the editor instance with the component state,
 * we need to create a separate instance that is not affected by the component re-renders.
 */
function makeEditorStateInstance<TEditor extends Editor | null = Editor | null>(initialEditor: TEditor) {
  let transactionNumber = 0
  let lastTransactionNumber = 0
  let lastSnapshot: EditorStateSnapshot<TEditor> = { editor: initialEditor, transactionNumber: 0 }
  let editor = initialEditor
  const subscribers = new Set<() => void>()

  const editorInstance = {
    /**
     * Get the current editor instance.
     */
    getSnapshot(): EditorStateSnapshot<TEditor> {
      if (transactionNumber === lastTransactionNumber) {
        return lastSnapshot
      }
      lastTransactionNumber = transactionNumber
      lastSnapshot = { editor, transactionNumber }
      return lastSnapshot
    },
    /**
     * Always disable the editor on the server-side.
     */
    getServerSnapshot(): EditorStateSnapshot<null> {
      return { editor: null, transactionNumber: 0 }
    },
    /**
     * Subscribe to the editor instance's changes.
     */
    subscribe(callback: () => void) {
      subscribers.add(callback)
      return () => {
        subscribers.delete(callback)
      }
    },
    /**
     * Watch the editor instance for changes.
     */
    watch(nextEditor: Editor | null) {
      editor = nextEditor as TEditor

      if (editor) {
        /**
         * This will force a re-render when the editor state changes.
         * This is to support things like `editor.can().toggleBold()` in components that `useEditor`.
         * This could be more efficient, but it's a good trade-off for now.
         */
        const fn = () => {
          transactionNumber += 1
          subscribers.forEach(callback => callback())
        }

        const currentEditor = editor

        currentEditor.on('transaction', fn)
        return () => {
          currentEditor.off('transaction', fn)
        }
      }
    },
  }

  return editorInstance
}

export function useEditorState<TSelectorResult>(
  options: UseEditorStateOptions<TSelectorResult, Editor>
): TSelectorResult;
export function useEditorState<TSelectorResult>(
  options: UseEditorStateOptions<TSelectorResult, Editor | null>
): TSelectorResult | null;

export function useEditorState<TSelectorResult>(
  options: UseEditorStateOptions<TSelectorResult, Editor> | UseEditorStateOptions<TSelectorResult, Editor | null>,
): TSelectorResult | null {
  const [editorInstance] = useState(() => makeEditorStateInstance(options.editor))

  // Using the `useSyncExternalStore` hook to sync the editor instance with the component state
  const selectedState = useSyncExternalStoreWithSelector(
    editorInstance.subscribe,
    editorInstance.getSnapshot,
    editorInstance.getServerSnapshot,
    options.selector as UseEditorStateOptions<TSelectorResult, Editor | null>['selector'],
    options.equalityFn,
  )

  useEffect(() => {
    return editorInstance.watch(options.editor)
  }, [options.editor])

  useDebugValue(selectedState)

  return selectedState
}
