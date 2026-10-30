import * as Y from 'yjs'

export function connectDocuments(first: Y.Doc, second: Y.Doc) {
  const sendToSecond = (update: Uint8Array, origin: unknown) => {
    if (origin !== second) {
      Y.applyUpdate(second, update, first)
    }
  }
  const sendToFirst = (update: Uint8Array, origin: unknown) => {
    if (origin !== first) {
      Y.applyUpdate(first, update, second)
    }
  }

  first.on('update', sendToSecond)
  second.on('update', sendToFirst)

  return () => {
    first.off('update', sendToSecond)
    second.off('update', sendToFirst)
  }
}
