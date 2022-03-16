import { useState, useEffect, DependencyList } from 'react'
import { EditorOptions } from '@tiptap/core'
import { Editor } from './Editor'

export const useEditor = (options: Partial<EditorOptions> = {}, deps: DependencyList = []) => {
  const [editor, setEditor] = useState<Editor | null>(null)

  useEffect(() => {
    const instance = new Editor(options)

    setEditor(instance)

    return () => {
      instance.destroy()
    }
  }, deps)

  return editor
}
