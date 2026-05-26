import { type Readable,writable } from 'svelte/store'

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
}): Readable<T> => {
  const store = writable<T>(selector({ editor }))

  let subscriberCount = 0

  const handleTransaction = () => {
    const next = selector({ editor })

    store.update(current => {
      if (shallowEqual(current, next)) {
        return current
      }

      return next
    })
  }

  return {
    subscribe(run, invalidate) {
      subscriberCount += 1

      if (subscriberCount === 1) {
        editor.on('transaction', handleTransaction)
      }

      const unsubscribe = store.subscribe(run, invalidate)

      return () => {
        unsubscribe()
        subscriberCount -= 1

        if (subscriberCount === 0) {
          editor.off('transaction', handleTransaction)
        }
      }
    },
  }
}
