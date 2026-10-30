import { Node, Schema } from 'prosemirror-model'
import { prosemirrorToYDoc } from './prosemirrorToYDoc.js'

/** Creates a Yjs document from ProseMirror JSON using the supplied schema. */
export function prosemirrorJSONToYDoc(
  schema: Schema,
  state: unknown,
  xmlFragment: string = 'prosemirror',
) {
  const doc = Node.fromJSON(schema, state)
  return prosemirrorToYDoc(doc, xmlFragment)
}
