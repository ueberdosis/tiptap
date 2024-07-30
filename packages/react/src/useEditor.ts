import { EditorOptions } from '@tiptap/core'
import {
  DependencyList, MutableRefObject,
  useDebugValue, useEffect, useRef, useState,
} from 'react'

import { Editor } from './Editor.js'
import { useEditorState } from './useEditorState.js'

const isDev = process.env.NODE_ENV !== 'production'
const isSSR = typeof window === 'undefined'
const isNext = isSSR || Boolean(typeof window !== 'undefined' && (window as any).next)

/**
 * The options for the `useEditor` hook.
 */
export type UseEditorOptions = Partial<EditorOptions> & {
  /**
   * Whether to render the editor on the first render.
   * If client-side rendering, set this to `true`.
   * If server-side rendering, set this to `false`.
   * @default true
   */
  immediatelyRender?: boolean;
  /**
   * Whether to re-render the editor on each transaction.
   * This is legacy behavior that will be removed in future versions.
   * @default true
   */
  shouldRerenderOnTransaction?: boolean;
};

/**
 * Create a new editor instance. And attach event listeners.
 */
function createEditor(options: MutableRefObject<UseEditorOptions>): Editor {
  const editor = new Editor(options.current)

  editor.on('beforeCreate', (...args) => options.current.onBeforeCreate?.(...args))
  editor.on('blur', (...args) => options.current.onBlur?.(...args))
  editor.on('create', (...args) => options.current.onCreate?.(...args))
  editor.on('destroy', (...args) => options.current.onDestroy?.(...args))
  editor.on('focus', (...args) => options.current.onFocus?.(...args))
  editor.on('selectionUpdate', (...args) => options.current.onSelectionUpdate?.(...args))
  editor.on('transaction', (...args) => options.current.onTransaction?.(...args))
  editor.on('update', (...args) => options.current.onUpdate?.(...args))
  editor.on('contentError', (...args) => options.current.onContentError?.(...args))

  return editor
}

/**
 * This hook allows you to create an editor instance.
 * @param options The editor options
 * @param deps The dependencies to watch for changes
 * @returns The editor instance
 * @example const editor = useEditor({ extensions: [...] })
 */
export function useEditor(
  options: UseEditorOptions & { immediatelyRender: true },
  deps?: DependencyList
): Editor;

/**
 * This hook allows you to create an editor instance.
 * @param options The editor options
 * @param deps The dependencies to watch for changes
 * @returns The editor instance
 * @example const editor = useEditor({ extensions: [...] })
 */
export function useEditor(
  options?: UseEditorOptions,
  deps?: DependencyList
): Editor | null;

export function useEditor(
  options: UseEditorOptions = {},
  deps: DependencyList = [],
): Editor | null {
  const mostRecentOptions = useRef(options)
  const [editor, setEditor] = useState(() => {
    if (options.immediatelyRender === undefined) {
      if (isSSR || isNext) {
        // TODO in the next major release, we should throw an error here
        if (isDev) {
          /**
           * Throw an error in development, to make sure the developer is aware that tiptap cannot be SSR'd
           * and that they need to set `immediatelyRender` to `false` to avoid hydration mismatches.
           */
          console.warn(
            'Tiptap Error: SSR has been detected, please set `immediatelyRender` explicitly to `false` to avoid hydration mismatches.',
          )
        }

        // Best faith effort in production, run the code in the legacy mode to avoid hydration mismatches and errors in production
        return null
      }

      // Default to immediately rendering when client-side rendering
      return createEditor(mostRecentOptions)
    }

    if (options.immediatelyRender && isSSR && isDev) {
      // Warn in development, to make sure the developer is aware that tiptap cannot be SSR'd, set `immediatelyRender` to `false` to avoid hydration mismatches.
      throw new Error(
        'Tiptap Error: SSR has been detected, and `immediatelyRender` has been set to `true` this is an unsupported configuration that may result in errors, explicitly set `immediatelyRender` to `false` to avoid hydration mismatches.',
      )
    }

    if (options.immediatelyRender) {
      return createEditor(mostRecentOptions)
    }

    return null
  })
  const mostRecentEditor = useRef<Editor | null>(editor)

  mostRecentEditor.current = editor

  useDebugValue(editor)

  // This effect will handle creating/updating the editor instance
  useEffect(() => {
    const destroyUnusedEditor = (editorInstance: Editor | null) => {
      if (editorInstance) {
        // We need to destroy the editor asynchronously to avoid memory leaks
        // because the editor instance is still being used in the component.

        setTimeout(() => {
          // re-use the editor instance if it hasn't been replaced yet
          // otherwise, asynchronously destroy the old editor instance
          if (editorInstance !== mostRecentEditor.current && !editorInstance.isDestroyed) {
            editorInstance.destroy()
          }
        })
      }
    }

    let editorInstance = mostRecentEditor.current

    if (!editorInstance) {
      editorInstance = createEditor(mostRecentOptions)
      setEditor(editorInstance)
      return () => destroyUnusedEditor(editorInstance)
    }

    if (!Array.isArray(deps) || deps.length === 0) {
      // if the editor does exist & deps are empty, we don't need to re-initialize the editor
      // we can fast-path to update the editor options on the existing instance
      editorInstance.setOptions(options)

      return () => destroyUnusedEditor(editorInstance)
    }

    // We need to destroy the editor instance and re-initialize it
    // when the deps array changes
    editorInstance.destroy()

    // the deps array is used to re-initialize the editor instance
    editorInstance = createEditor(mostRecentOptions)
    setEditor(editorInstance)
    return () => destroyUnusedEditor(editorInstance)
  }, deps)

  // The default behavior is to re-render on each transaction
  // This is legacy behavior that will be removed in future versions
  useEditorState({
    editor,
    selector: ({ transactionNumber }) => {
      if (options.shouldRerenderOnTransaction === false) {
        // This will prevent the editor from re-rendering on each transaction
        return null
      }

      // This will avoid re-rendering on the first transaction when `immediatelyRender` is set to `true`
      if (options.immediatelyRender && transactionNumber === 0) {
        return 0
      }
      return transactionNumber + 1
    },
  })

  return editor
}
