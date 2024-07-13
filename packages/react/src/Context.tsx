import React, {
  createContext, ReactNode, useContext, useMemo,
} from 'react'

import { Editor } from './Editor.js'
import { EditorContent } from './EditorContent.js'
import { useEditor, UseEditorOptions } from './useEditor.js'

export type EditorContextValue = {
  editor: Editor | null;
}

export const EditorContext = createContext<EditorContextValue>({
  editor: null,
})

export const EditorConsumer = EditorContext.Consumer

/**
 * A hook to get the current editor instance.
 */
export const useCurrentEditor = () => useContext(EditorContext)

export type EditorProviderProps = {
  children?: ReactNode;
  slotBefore?: ReactNode;
  slotAfter?: ReactNode;
} & UseEditorOptions

/**
 * This is the provider component for the editor.
 * It allows the editor to be accessible across the entire component tree
 * with `useCurrentEditor`.
 */
export function EditorProvider({
  children, slotAfter, slotBefore, ...editorOptions
}: EditorProviderProps) {
  const editor = useEditor(editorOptions)
  const editorContext = useMemo(() => ({ editor }), [editor])

  if (!editor) {
    return null
  }

  return (
    <EditorContext.Provider value={editorContext}>
      {slotBefore}
      <EditorContent editor={editor} />
      {children}
      {slotAfter}
    </EditorContext.Provider>
  )
}
