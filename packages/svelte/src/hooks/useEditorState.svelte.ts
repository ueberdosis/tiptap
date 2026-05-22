import { type Writable, writable } from 'svelte/store'

import type { Editor } from '../Editor.js'

export type EditorStateSnapshot = {
  editor: Editor
}

const shallowEqual = (a: Record<string, any>, b: Record<string, any>) => {
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

export const useEditorState = <T extends Record<string, any>>({
  editor,
  selector,
}: {
  editor: Editor
  selector: (ctx: EditorStateSnapshot) => T
}): Writable<T> => {
  const store = writable(selector({ editor }))

  const update = () => {
    const next = selector({ editor })

    store.update(current => {
      if (shallowEqual(current, next)) {
        return current
      }
      return next
    })
  }

  editor.on('transaction', update)

  return store
}
