import type { Accessor } from 'solid-js'
import { createMemo, createSignal, onCleanup } from 'solid-js'

import type { Editor } from './Editor.js'

export type EditorStateSnapshot<TEditor extends Editor = Editor> = {
  editor: TEditor
}

const shallowEqual = (a: Record<string, unknown>, b: Record<string, unknown>) => {
  const aKeys = Object.keys(a)

  if (aKeys.length !== Object.keys(b).length) {
    return false
  }

  for (const key of aKeys) {
    if (a[key] !== b[key]) {
      return false
    }
  }

  return true
}

export const useEditorState = <T extends Record<string, unknown>>({
  editor,
  selector,
}: {
  editor: Editor
  selector: (ctx: EditorStateSnapshot) => T
}): Accessor<T> => {
  const [version, setVersion] = createSignal(0)

  const handleTransaction = () => {
    setVersion(v => v + 1)
  }

  editor.on('transaction', handleTransaction)

  onCleanup(() => {
    editor.off('transaction', handleTransaction)
  })

  let previous: T | undefined

  return createMemo(() => {
    version()

    const next = selector({ editor })

    if (previous && shallowEqual(previous, next)) {
      return previous
    }

    previous = next

    return next
  })
}
