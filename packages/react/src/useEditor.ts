import { useState, useEffect } from 'react'
import { EditorOptions } from '@tiptap/core'
import { Editor } from './Editor'

function useForceUpdate() {
  const [_, setValue] = useState(0)

  return () => setValue(value => value + 1)
}

export const useEditor = (options: Partial<EditorOptions> = {}) => {
  const [editor, setEditor] = useState<Editor | null>(null)
  const forceUpdate = useForceUpdate()

  useEffect(() => {
    const instance = new Editor(options)

    setEditor(instance)

    instance.on('transaction', forceUpdate)

    return () => {
      instance.destroy()
    }
  }, [])

  return editor
}
