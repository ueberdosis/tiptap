import { Editor } from '@tiptap/react'
import { useContext, useEffect, useState } from 'react'

import { EditorContext } from './EditorProvider'

function useForceUpdate() {
  const [, setValue] = useState(0)

  return () => setValue(value => value + 1)
}

/**
 * Retrieves the editor object from <EditorProvider />
 */
export function useCurrentEditor(): Editor | null {
  const editor = useContext(EditorContext)
  const forceUpdate = useForceUpdate()

  useEffect(() => {
    function handleTransaction() {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (editor) {
            forceUpdate()
          }
        })
      })
    }

    editor?.on('transaction', handleTransaction)

    return () => {
      editor?.off('transaction', handleTransaction)
    }
  }, [editor])

  if (editor === null) {
    throw new Error('EditorContext is not defined. Did you forget to wrap your component in a EditorProvider?')
  }

  return editor
}
