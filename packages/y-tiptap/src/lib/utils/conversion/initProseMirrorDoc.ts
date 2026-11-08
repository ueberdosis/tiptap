import { createNodeFromYElement } from './createNodeFromYElement.js'
import type { InitialProseMirrorDoc } from '../../../types/InitialProseMirrorDoc.js'
import { createEmptyMeta } from './createEmptyMeta.js'
import * as Y from 'yjs'
import { Schema, Fragment } from 'prosemirror-model'
import * as error from 'lib0/error'

/** Creates the initial ProseMirror document and its Yjs node mapping. */
export const initProseMirrorDoc = (
  yXmlFragment: Y.XmlFragment,
  schema: Schema,
): InitialProseMirrorDoc => {
  const meta = createEmptyMeta()
  const fragmentContent = yXmlFragment
    .toArray()
    .map(t => {
      if (!(t instanceof Y.XmlElement)) throw error.methodUnimplemented()
      return createNodeFromYElement(t, schema, meta)
    })
    .filter(n => n !== null)
  const doc = schema.topNodeType.create(null, Fragment.fromArray(fragmentContent))
  return { doc, meta, mapping: meta.mapping }
}
