import * as Y from 'yjs'
import { Node, Schema } from 'prosemirror-model'
import { yXmlFragmentToProsemirrorJSON } from './yXmlFragmentToProsemirrorJSON.js'

/** Creates a ProseMirror document from a Yjs XML fragment. */
export function yXmlFragmentToProsemirror(schema: Schema, xmlFragment: Y.XmlFragment) {
  const state = yXmlFragmentToProsemirrorJSON(xmlFragment)
  return Node.fromJSON(schema, state)
}
