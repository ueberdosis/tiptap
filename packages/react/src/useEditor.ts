import { EditorOptions } from '@tiptap/core'
import { DependencyList, useEffect, useState } from 'react'

import { Editor } from './Editor'

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

  // This effect will handle updating the editor instance
  // when the event handlers change.
  useEffect(() => {
    if (!editor) {
      return
    }

    if (onBeforeCreate) {
      editor.off('beforeCreate')
      editor.on('beforeCreate', onBeforeCreate)
    }

    if (onBlur) {
      editor.off('blur')
      editor.on('blur', onBlur)
    }

    if (onCreate) {
      editor.off('create')
      editor.on('create', onCreate)
    }

    if (onDestroy) {
      editor.off('destroy')
      editor.on('destroy', onDestroy)
    }

    if (onFocus) {
      editor.off('focus')
      editor.on('focus', onFocus)
    }

    if (onSelectionUpdate) {
      editor.off('selectionUpdate')
      editor.on('selectionUpdate', onSelectionUpdate)
    }

    if (onTransaction) {
      editor.off('transaction')
      editor.on('transaction', onTransaction)
    }

    if (onUpdate) {
      editor.off('update')
      editor.on('update', onUpdate)
    }
  }, [onBeforeCreate, onBlur, onCreate, onDestroy, onFocus, onSelectionUpdate, onTransaction, onUpdate])

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
      instance.destroy()
      isMounted = false
    }
  }, deps)

  return editor
}
