import { EditorOptions } from '@tiptap/core'
import {
  DependencyList,
  useEffect,
  useRef,
  useState,
} from 'react'

import { Editor } from './Editor.js'

function useForceUpdate() {
  const [, setValue] = useState(0)

  return () => setValue(value => value + 1)
}

export const useEditor = (options: Partial<EditorOptions> = {}, deps: DependencyList = []) => {
  const [editor, setEditor] = useState<Editor | null>(null)

  const forceUpdate = useForceUpdate()

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
  }, [onBeforeCreate, onBlur, onCreate, onDestroy, onFocus, onSelectionUpdate, onTransaction, onUpdate, editor])

  useEffect(() => {
    let isMounted = true

    const instance = new Editor(options)

    setEditor(instance)

    instance.on('transaction', () => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (isMounted) {
            forceUpdate()
          }
        })
      })
    })

    return () => {
      isMounted = false
    }
  }, deps)

  useEffect(() => {
    return () => {
      editor?.destroy()
    }
  }, [editor])

  return editor
}
