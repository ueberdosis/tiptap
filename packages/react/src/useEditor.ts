import { EditorOptions } from '@tiptap/core'
import {
  DependencyList, useDebugValue, useEffect, useRef, useState,
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
  const isMounted = useRef(false)
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
      return new Editor(options)
    }

    if (options.immediatelyRender && isSSR && isDev) {
      // Warn in development, to make sure the developer is aware that tiptap cannot be SSR'd, set `immediatelyRender` to `false` to avoid hydration mismatches.
      throw new Error(
        'Tiptap Error: SSR has been detected, and `immediatelyRender` has been set to `true` this is an unsupported configuration that may result in errors, explicitly set `immediatelyRender` to `false` to avoid hydration mismatches.',
      )
    }

    if (options.immediatelyRender) {
      return new Editor(options)
    }

    return null
  })

  useDebugValue(editor)

  // This effect will handle creating/updating the editor instance
  useEffect(() => {
    let editorInstance: Editor | null = editor

    if (!editorInstance) {
      editorInstance = new Editor(options)
      // instantiate the editor if it doesn't exist
      // for ssr, this is the first time the editor is created
      setEditor(editorInstance)
    } else {
      // if the editor does exist, update the editor options accordingly
      editorInstance.setOptions(options)
    }
  }, deps)

  const {
    onBeforeCreate,
    onBlur,
    onCreate,
    onDestroy,
    onFocus,
    onSelectionUpdate,
    onTransaction,
    onUpdate,
    onContentError,
  } = options

  const onBeforeCreateRef = useRef(onBeforeCreate)
  const onBlurRef = useRef(onBlur)
  const onCreateRef = useRef(onCreate)
  const onDestroyRef = useRef(onDestroy)
  const onFocusRef = useRef(onFocus)
  const onSelectionUpdateRef = useRef(onSelectionUpdate)
  const onTransactionRef = useRef(onTransaction)
  const onUpdateRef = useRef(onUpdate)
  const onContentErrorRef = useRef(onContentError)

  // This effect will handle updating the editor instance
  // when the event handlers change.
  useEffect(() => {
    if (!editor) {
      return
    }

    if (onBeforeCreate) {
      editor.off('beforeCreate', onBeforeCreateRef.current)
      editor.on('beforeCreate', onBeforeCreate)

      onBeforeCreateRef.current = onBeforeCreate
    }

    if (onBlur) {
      editor.off('blur', onBlurRef.current)
      editor.on('blur', onBlur)

      onBlurRef.current = onBlur
    }

    if (onCreate) {
      editor.off('create', onCreateRef.current)
      editor.on('create', onCreate)

      onCreateRef.current = onCreate
    }

    if (onDestroy) {
      editor.off('destroy', onDestroyRef.current)
      editor.on('destroy', onDestroy)

      onDestroyRef.current = onDestroy
    }

    if (onFocus) {
      editor.off('focus', onFocusRef.current)
      editor.on('focus', onFocus)

      onFocusRef.current = onFocus
    }

    if (onSelectionUpdate) {
      editor.off('selectionUpdate', onSelectionUpdateRef.current)
      editor.on('selectionUpdate', onSelectionUpdate)

      onSelectionUpdateRef.current = onSelectionUpdate
    }

    if (onTransaction) {
      editor.off('transaction', onTransactionRef.current)
      editor.on('transaction', onTransaction)

      onTransactionRef.current = onTransaction
    }

    if (onUpdate) {
      editor.off('update', onUpdateRef.current)
      editor.on('update', onUpdate)

      onUpdateRef.current = onUpdate
    }

    if (onContentError) {
      editor.off('contentError', onContentErrorRef.current)
      editor.on('contentError', onContentError)

      onContentErrorRef.current = onContentError
    }
  }, [
    onBeforeCreate,
    onBlur,
    onCreate,
    onDestroy,
    onFocus,
    onSelectionUpdate,
    onTransaction,
    onUpdate,
    onContentError,
    editor,
  ])

  /**
   * Destroy the editor instance when the component completely unmounts
   * As opposed to the cleanup function in the effect above, this will
   * only be called when the component is removed from the DOM, since it has no deps.
   * */
  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
      if (editor) {
        // We need to destroy the editor asynchronously to avoid memory leaks
        // because the editor instance is still being used in the component.

        setTimeout(() => {
          // re-use the editor instance if it hasn't been destroyed yet
          // and the component is still mounted
          // otherwise, asynchronously destroy the editor instance
          if (!isMounted.current && !editor.isDestroyed) {
            editor.destroy()
          }
        })
      }
    }
  }, [])

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
