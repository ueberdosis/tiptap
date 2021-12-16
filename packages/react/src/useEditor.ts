import { useState, useEffect, DependencyList } from 'react'
import { EditorOptions } from '@tiptap/core'
import { Editor } from './Editor'

type UseEditorOptions = EditorOptions & {
  availableOnFirstRender: boolean
}

function useForceUpdate() {
  const [, setValue] = useState(0)

  return () => setValue(value => value + 1)
}

export const useEditor = (options: Partial<UseEditorOptions> = {}, deps: DependencyList = []): Editor | null => {
  const { availableOnFirstRender, ...editorOptions } = options
  const [editor, setEditor] = useState<Editor | null>(() => {
    return availableOnFirstRender ? new Editor(editorOptions) : null
  })

  const forceUpdate = useForceUpdate()

  useEffect(() => {
    let instance: Editor

    if (!editor || editor.isDestroyed) {
      instance = new Editor(options)
      setEditor(instance)
    } else {
      instance = editor
    }

    instance.on('transaction', () => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          forceUpdate()
        })
      })
    })

    return () => {
      instance.destroy()
    }
  }, deps)

  return editor
}
