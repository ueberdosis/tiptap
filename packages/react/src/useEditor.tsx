import React, { createContext, useContext, useState } from "react"
import type { Editor } from "@tiptap/core"

/**
 * Create two separate contexts to read from and write to Editor context.
 * https://kentcdodds.com/blog/how-to-optimize-your-context-value
 */

export const EditorContext = createContext<Editor|undefined>(undefined)
EditorContext.displayName = 'EditorStateContext'

export const SetEditorContext = createContext<((editor: Editor) => void)>(() => undefined)
SetEditorContext.displayName = 'SetEditorStateContext'

export const useEditor = () => {
  const editor = useContext(EditorContext)
  return editor
}

export const useSetEditor = () => {
  const setEditor = useContext(SetEditorContext)
  if (!setEditor) {
    throw new Error(
      `useSetEditor must be used inside of an EditorProvider`
    )
  }
  return setEditor
}

export const EditorProvider = ({children}: {children: React.ReactNode}) => {
  const [editor, setEditor] = useState<Editor|undefined>(undefined)
  return (
    <EditorContext.Provider value={editor}>
      <SetEditorContext.Provider value={setEditor}>
        {children}
      </SetEditorContext.Provider>
    </EditorContext.Provider>
  )
}