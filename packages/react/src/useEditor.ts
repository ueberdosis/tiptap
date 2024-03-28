import { EditorOptions } from '@tiptap/core'
import {
  DependencyList,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { Editor } from './Editor.js'

export const useEditor = (options: Partial<EditorOptions> = {}, deps: DependencyList = []) => {
  const editorRef = useRef<Editor | null>(null)
  const [, forceUpdate] = useState({})

  const {
    onBeforeCreate,
    onBlur,
    onCreate,
    onDestroy,
    onFocus,
    onSelectionUpdate,
    onTransaction,
    onUpdate,
  } = options

  const onBeforeCreateRef = useRef(onBeforeCreate)
  const onBlurRef = useRef(onBlur)
  const onCreateRef = useRef(onCreate)
  const onDestroyRef = useRef(onDestroy)
  const onFocusRef = useRef(onFocus)
  const onSelectionUpdateRef = useRef(onSelectionUpdate)
  const onTransactionRef = useRef(onTransaction)
  const onUpdateRef = useRef(onUpdate)

  // This effect will handle updating the editor instance
  // when the event handlers change.
  useEffect(() => {
    if (!editorRef.current) {
      return
    }

    if (onBeforeCreate) {
      editorRef.current.off('beforeCreate', onBeforeCreateRef.current)
      editorRef.current.on('beforeCreate', onBeforeCreate)

      onBeforeCreateRef.current = onBeforeCreate
    }

    if (onBlur) {
      editorRef.current.off('blur', onBlurRef.current)
      editorRef.current.on('blur', onBlur)

      onBlurRef.current = onBlur
    }

    if (onCreate) {
      editorRef.current.off('create', onCreateRef.current)
      editorRef.current.on('create', onCreate)

      onCreateRef.current = onCreate
    }

    if (onDestroy) {
      editorRef.current.off('destroy', onDestroyRef.current)
      editorRef.current.on('destroy', onDestroy)

      onDestroyRef.current = onDestroy
    }

    if (onFocus) {
      editorRef.current.off('focus', onFocusRef.current)
      editorRef.current.on('focus', onFocus)

      onFocusRef.current = onFocus
    }

    if (onSelectionUpdate) {
      editorRef.current.off('selectionUpdate', onSelectionUpdateRef.current)
      editorRef.current.on('selectionUpdate', onSelectionUpdate)

      onSelectionUpdateRef.current = onSelectionUpdate
    }

    if (onTransaction) {
      editorRef.current.off('transaction', onTransactionRef.current)
      editorRef.current.on('transaction', onTransaction)

      onTransactionRef.current = onTransaction
    }

    if (onUpdate) {
      editorRef.current.off('update', onUpdateRef.current)
      editorRef.current.on('update', onUpdate)

      onUpdateRef.current = onUpdate
    }
  }, [onBeforeCreate, onBlur, onCreate, onDestroy, onFocus, onSelectionUpdate, onTransaction, onUpdate, editorRef.current])

  useEffect(() => {
    let isMounted = true

    editorRef.current = new Editor(options)

    editorRef.current.on('transaction', () => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (isMounted) {
            forceUpdate({})
          }
        })
      })
    })

    return () => {
      isMounted = false
      editorRef.current?.destroy()
    }
  }, deps)

  return editorRef.current
}

/**
 * This hook will create and immediately return a defined editor instance. In future major versions, this
 * hook will be removed and useEditor will be changed to behave like this hook.
 */
export const useEditorForImmediateRender = (options: Partial<EditorOptions> = {}, deps: DependencyList = []) => {
  const {
    onBeforeCreate,
    onBlur,
    onCreate,
    onDestroy,
    onFocus,
    onSelectionUpdate,
    onTransaction,
    onUpdate,
  } = options

  const onBeforeCreateRef = useRef(onBeforeCreate)
  const onBlurRef = useRef(onBlur)
  const onCreateRef = useRef(onCreate)
  const onDestroyRef = useRef(onDestroy)
  const onFocusRef = useRef(onFocus)
  const onSelectionUpdateRef = useRef(onSelectionUpdate)
  const onTransactionRef = useRef(onTransaction)
  const onUpdateRef = useRef(onUpdate)

  const isMounted = useRef(false)

  useEffect(() => {
    isMounted.current = true

    return () => {
      isMounted.current = false
    }
  }, [])

  const [, forceUpdate] = useState({})
  const editor = useMemo(() => {
    const instance = new Editor(options)

    instance.on('transaction', () => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (isMounted.current) {
            forceUpdate({})
          }
        })
      })
    })

    return instance
  }, deps)

  useEffect(() => {
    return () => {
      editor.destroy()
    }
  }, [editor])

  // This effect will handle updating the editor instance
  // when the event handlers change.
  useEffect(() => {
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
  }, [onBeforeCreate, onBlur, onCreate, onDestroy, onFocus, onSelectionUpdate, onTransaction, onUpdate, editor])

  return editor
}
