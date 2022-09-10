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
