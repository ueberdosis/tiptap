import * as Y from 'yjs'
import { Node } from 'prosemirror-model'
import { prosemirrorToYXmlFragment } from './prosemirrorToYXmlFragment.js'

/** Creates a Yjs document from a ProseMirror document. */
export function prosemirrorToYDoc(doc: Node, xmlFragment: string = 'prosemirror') {
  const ydoc = new Y.Doc()
  const type = ydoc.getXmlFragment(xmlFragment)
  if (!type.doc) {
    return ydoc
  }
  prosemirrorToYXmlFragment(doc, type)
  return type.doc
}
