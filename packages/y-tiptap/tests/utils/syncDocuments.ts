import * as Y from 'yjs'

export const syncDocuments = (first: Y.Doc, second: Y.Doc) => {
  Y.applyUpdate(second, Y.encodeStateAsUpdate(first))
  Y.applyUpdate(first, Y.encodeStateAsUpdate(second))
}
