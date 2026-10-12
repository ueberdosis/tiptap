import { createNodeFromYElement } from './createNodeFromYElement.js'
import type { InitialProseMirrorDoc } from '../../../types/InitialProseMirrorDoc.js'
import { createEmptyMeta } from './createEmptyMeta.js'
import * as Y from 'yjs'
import { Schema, Fragment } from 'prosemirror-model'
import * as error from 'lib0/error'
import { validateDocumentContent } from './validateDocumentContent.js'

/** Creates the initial ProseMirror document and its Yjs node mapping. */
export const initProseMirrorDoc = (
  yXmlFragment: Y.XmlFragment,
  schema: Schema,
): InitialProseMirrorDoc => {
  const meta = createEmptyMeta()
  const fragmentContent = yXmlFragment.toArray().map(t => {
    if (!(t instanceof Y.XmlElement)) throw error.methodUnimplemented()
    return createNodeFromYElement(t, schema, meta)
  })
  const content = Fragment.fromArray(fragmentContent)
  validateDocumentContent(content, schema)
  const doc = schema.topNodeType.createChecked(null, content)
  return { doc, meta, mapping: meta.mapping }
}
