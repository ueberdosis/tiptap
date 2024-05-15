import { EditorOptions } from '@tiptap/core'
import {
  DependencyList,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'

import { Editor } from './Editor.js'

const isDev = process.env.NODE_ENV !== 'production'
const isSSR = typeof window === 'undefined'
const isNext = isSSR || Boolean(typeof window !== 'undefined' && (window as any).next)

/**
 * The options for the `useEditor` hook.
 */
export type UseEditorOptions<TSelectorResult> = Partial<EditorOptions> & {
  /**
   * Whether to render the editor on the first render.
   * If client-side rendering, set this to `true`.
   * If server-side rendering, set this to `false`.
   * @default true
   */
  immediatelyRender?: boolean;
  /**
   * A selector function to determine the value to compare for re-rendering.
   * @default `({ transactionNumber }) => transactionNumber + 1`
   */
  selector?: (editor:Editor, options: {
    /**
     * The previous value returned by the selector.
     */
    previousValue: TSelectorResult | null;
    /**
     * The current transaction number. Incremented on every transaction.
     */
    transactionNumber: number
  }) => TSelectorResult;
  /**
   * A custom equality function to determine if the editor should re-render.
   * @default `(a, b) => a === b`
   */
  equalityFn?: (a: TSelectorResult, b: TSelectorResult | null) => boolean;
}

/**
 * To synchronize the editor instance with the component state,
 * we need to create a separate instance that is not affected by the component re-renders.
 */
function makeEditorInstance<TSelectorResult>({
  immediatelyRender,
  options: initialOptions,
  selector = (_e, { transactionNumber }) => (transactionNumber + 1) as unknown as TSelectorResult,
  equalityFn = (a: TSelectorResult, b: TSelectorResult | null) => a === b,
}: Pick<UseEditorOptions<TSelectorResult>, 'selector' | 'equalityFn' | 'immediatelyRender'> & {
  options: Partial<EditorOptions>;
}) {

  let editor: Editor | null = null
  let transactionNumber = 0
  let prevSnapshot: [Editor | null, TSelectorResult | null] = [editor, null]
  const subscribers = new Set<() => void>()

  const editorInstance = {
    /**
     * Get the current editor instance.
     */
    getSnapshot() {
      if (!editor) {
        return prevSnapshot
      }

      const nextSnapshotResult = selector(editor, { previousValue: prevSnapshot[1], transactionNumber })

      if (equalityFn(nextSnapshotResult, prevSnapshot[1])) {
        return prevSnapshot
      }

      const nextSnapshot: [Editor, TSelectorResult | null] = [editor, nextSnapshotResult]

      prevSnapshot = nextSnapshot
      return nextSnapshot
    },
    /**
     * Always disable the editor on the server-side.
     */
    getServerSnapshot() {
      return null
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
     * Create the editor instance.
     */
    create(options: Partial<EditorOptions>) {
      if (editor) {
        editor.destroy()
      }
      editor = new Editor(options)
      subscribers.forEach(callback => callback())

      if (editor) {
      /**
       * This will force a re-render when the editor state changes.
       * This is to support things like `editor.can().toggleBold()` in components that `useEditor`.
       * This could be more efficient, but it's a good trade-off for now.
       */
        editor.on('transaction', () => {
          transactionNumber += 1
          subscribers.forEach(callback => callback())
        })
      }
    },
    /**
     * Destroy the editor instance.
     */
    destroy(): void {
      if (editor) {
        // We need to destroy the editor asynchronously to avoid memory leaks
        // because the editor instance is still being used in the component.
        const editorToDestroy = editor

        setTimeout(() => editorToDestroy.destroy())
      }
      editor = null
    },
  }

  if (immediatelyRender) {
    editorInstance.create(initialOptions)
  }

  return editorInstance
}

/**
 * This hook allows you to create an editor instance.
 * @param options The editor options
 * @param deps The dependencies to watch for changes
 * @returns The editor instance
 * @example const editor = useEditor({ extensions: [...] })
 */
function useEditor<TSelectorResult>(options: UseEditorOptions<TSelectorResult> & { immediatelyRender: true }, deps?: DependencyList): Editor;

/**
 * This hook allows you to create an editor instance.
 * @param options The editor options
 * @param deps The dependencies to watch for changes
 * @returns The editor instance
 * @example const editor = useEditor({ extensions: [...] })
 */
function useEditor<TSelectorResult>(options?: UseEditorOptions<TSelectorResult>, deps?: DependencyList): Editor | null;

function useEditor<TSelectorResult>(options: UseEditorOptions<TSelectorResult> = {}, deps: DependencyList = []): Editor | null {
  const [editorInstance] = useState(() => {
    const instanceCreateOptions: Parameters<(typeof makeEditorInstance<TSelectorResult>)>[0] = {
      immediatelyRender: Boolean(options.immediatelyRender),
      equalityFn: options.equalityFn,
      selector: options.selector,
      options,
    }

    if (options.immediatelyRender === undefined) {
      if (isSSR || isNext) {
        // TODO in the next major release, we should throw an error here
        if (isDev) {
          /**
           * Throw an error in development, to make sure the developer is aware that tiptap cannot be SSR'd
           * and that they need to set `immediatelyRender` to `false` to avoid hydration mismatches.
           */
          console.warn('Tiptap Error: SSR has been detected, please set `immediatelyRender` explicitly to `false` to avoid hydration mismatches.')
        }

        // Best faith effort in production, run the code in the legacy mode to avoid hydration mismatches and errors in production
        instanceCreateOptions.immediatelyRender = false
        return makeEditorInstance(instanceCreateOptions)
      }

      // Default to `true` in client-side rendering
      instanceCreateOptions.immediatelyRender = true
      return makeEditorInstance(instanceCreateOptions)
    }

    if (options.immediatelyRender && isSSR && isDev) {
      // Warn in development, to make sure the developer is aware that tiptap cannot be SSR'd, set `immediatelyRender` to `false` to avoid hydration mismatches.
      throw new Error('Tiptap Error: SSR has been detected, and `immediatelyRender` has been set to `true` this is an unsupported configuration that may result in errors, explicitly set `immediatelyRender` to `false` to avoid hydration mismatches.')
    }

    return makeEditorInstance(instanceCreateOptions)
  })

  // Using the `useSyncExternalStore` hook to sync the editor instance with the component state
  const editor = useSyncExternalStore(editorInstance.subscribe, editorInstance.getSnapshot, editorInstance.getServerSnapshot)?.[0] || null

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
  }, [onBeforeCreate, onBlur, onCreate, onDestroy, onFocus, onSelectionUpdate, onTransaction, onUpdate, onContentError, editor])

  // This effect will handle creating/updating the editor instance
  useEffect(() => {
    if (!editor) {
      // instantiate the editor if it doesn't exist
      // for ssr, this is the first time the editor is created
      editorInstance.create(options)
    } else {
      // if the editor does exist, update the editor options accordingly
      editor.setOptions(options)
    }
  }, deps)

  /**
   * Destroy the editor instance when the component completely unmounts
   * As opposed to the cleanup function in the effect above, this will
   * only be called when the component is removed from the DOM, since it has no deps.
   * */
  useEffect(() => {
    return () => {
      editorInstance.destroy()
    }
  }, [])

  return editor
}

export { useEditor }
