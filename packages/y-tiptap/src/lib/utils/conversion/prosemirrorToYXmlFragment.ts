import type { TransactionSource } from '../../../types/TransactionSource.js'
import { updateYFragment } from '../reconciliation/updateYFragment.js'
import * as Y from 'yjs'
import { Node } from 'prosemirror-model'

/** Converts a ProseMirror document into a new or existing Yjs XML fragment. */
export function prosemirrorToYXmlFragment(doc: Node, xmlFragment?: Y.XmlFragment) {
  const type = xmlFragment || new Y.XmlFragment()
  const ydoc: TransactionSource = type.doc ?? { transact: callback => callback() }
  updateYFragment(ydoc, type, doc, { mapping: new Map(), isOMark: new Map() })
  return type
}
