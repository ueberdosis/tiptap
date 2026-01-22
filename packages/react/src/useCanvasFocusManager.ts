import type { CanvasFocusManager,Editor } from '@dibdab/core'
import { createCanvasFocusManager } from '@dibdab/core'
import { useCallback, useEffect, useRef,useState } from 'react'

export interface UseCanvasFocusManagerOptions {
  /**
   * Whether to auto-focus when clicking on an editor
   * @default true
   */
  autoFocus?: boolean

  /**
   * Whether to blur other editors when focusing one
   * @default true
   */
  exclusiveFocus?: boolean

  /**
   * Callback when focus changes between editors
   */
  onFocusChange?: (editor: Editor | null, previousEditor: Editor | null) => void
}

export function useCanvasFocusManager(options: UseCanvasFocusManagerOptions = {}) {
  const managerRef = useRef<CanvasFocusManager | null>(null)
  const [focusedEditor, setFocusedEditor] = useState<Editor | null>(null)
  const [registeredEditors, setRegisteredEditors] = useState<Editor[]>([])

  // Initialize focus manager
  useEffect(() => {
    managerRef.current = createCanvasFocusManager({
      autoFocus: options.autoFocus,
      exclusiveFocus: options.exclusiveFocus,
      onFocusChange: (editor, previousEditor) => {
        setFocusedEditor(editor)
        if (options.onFocusChange) {
          options.onFocusChange(editor, previousEditor)
        }
      },
      onEditorRegistered: () => {
        if (managerRef.current) {
          setRegisteredEditors(managerRef.current.getAllEditors())
        }
      },
      onEditorUnregistered: () => {
        if (managerRef.current) {
          setRegisteredEditors(managerRef.current.getAllEditors())
        }
      },
    })

    return () => {
      if (managerRef.current) {
        managerRef.current.destroy()
      }
    }
  }, [options.autoFocus, options.exclusiveFocus, options.onFocusChange])

  const registerEditor = useCallback((editor: Editor) => {
    if (managerRef.current) {
      managerRef.current.registerEditor(editor)
    }
  }, [])

  const unregisterEditor = useCallback((editor: Editor | string) => {
    if (managerRef.current) {
      managerRef.current.unregisterEditor(editor)
    }
  }, [])

  const setFocus = useCallback((editor: Editor | string | null) => {
    if (managerRef.current) {
      managerRef.current.setFocusedEditor(editor)
    }
  }, [])

  const focusNext = useCallback(() => {
    if (managerRef.current) {
      managerRef.current.focusNext()
    }
  }, [])

  const focusPrevious = useCallback(() => {
    if (managerRef.current) {
      managerRef.current.focusPrevious()
    }
  }, [])

  const blurAll = useCallback(() => {
    if (managerRef.current) {
      managerRef.current.blurAll()
    }
  }, [])

  const getEditor = useCallback((nodeId: string) => {
    return managerRef.current?.getEditor(nodeId)
  }, [])

  const getVisibleEditors = useCallback(() => {
    return managerRef.current?.getVisibleEditors() || []
  }, [])

  return {
    manager: managerRef.current,
    focusedEditor,
    registeredEditors,
    registerEditor,
    unregisterEditor,
    setFocus,
    focusNext,
    focusPrevious,
    blurAll,
    getEditor,
    getVisibleEditors,
  }
}
