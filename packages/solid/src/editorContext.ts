import { createContext, useContext } from 'solid-js'

import type { Editor } from './Editor.js'

export const EditorContext = createContext<Editor>()

export function getEditor(): Editor {
  const editor = useContext(EditorContext)

  if (!editor) {
    throw new Error('getEditor must be used within a <Tiptap> provider')
  }

  return editor
}
