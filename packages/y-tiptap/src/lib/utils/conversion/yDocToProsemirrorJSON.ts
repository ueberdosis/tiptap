import * as Y from 'yjs'
import { yXmlFragmentToProsemirrorJSON } from './yXmlFragmentToProsemirrorJSON.js'

/** Reads ProseMirror JSON from the named Yjs XML fragment. */
export function yDocToProsemirrorJSON(ydoc: Y.Doc, xmlFragment: string = 'prosemirror') {
  return yXmlFragmentToProsemirrorJSON(ydoc.getXmlFragment(xmlFragment))
}
