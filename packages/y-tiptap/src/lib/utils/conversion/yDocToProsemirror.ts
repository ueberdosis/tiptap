import * as Y from 'yjs'
import { Node, Schema } from 'prosemirror-model'
import { yDocToProsemirrorJSON } from './yDocToProsemirrorJSON.js'

/** Creates a ProseMirror document from the named Yjs XML fragment. */
export function yDocToProsemirror(schema: Schema, ydoc: Y.Doc) {
  const state = yDocToProsemirrorJSON(ydoc)
  return Node.fromJSON(schema, state)
}
