import { createNodeFromYElement } from './createNodeFromYElement.js'
import { createEmptyMeta } from './createEmptyMeta.js'
import * as Y from 'yjs'
import { Schema, Fragment } from 'prosemirror-model'
import * as error from 'lib0/error'

/** Converts Yjs XML content to a ProseMirror fragment using the supplied schema. */
export const yXmlFragmentToProseMirrorFragment = (yXmlFragment: Y.XmlFragment, schema: Schema) => {
  const fragmentContent = yXmlFragment
    .toArray()
    .map(t => {
      if (!(t instanceof Y.XmlElement)) throw error.methodUnimplemented()
      return createNodeFromYElement(t, schema, createEmptyMeta())
    })
    .filter(n => n !== null)
  return Fragment.fromArray(fragmentContent)
}
