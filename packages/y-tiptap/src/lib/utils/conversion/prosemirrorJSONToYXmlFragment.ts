import * as Y from 'yjs'
import { Node, Schema } from 'prosemirror-model'
import { prosemirrorToYXmlFragment } from './prosemirrorToYXmlFragment.js'

/** Converts ProseMirror JSON into a new or existing Yjs XML fragment. */
export function prosemirrorJSONToYXmlFragment(
  schema: Schema,
  state: unknown,
  xmlFragment?: Y.XmlFragment,
) {
  const doc = Node.fromJSON(schema, state)
  return prosemirrorToYXmlFragment(doc, xmlFragment)
}
