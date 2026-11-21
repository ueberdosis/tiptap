import type { BindingMetadata } from '../../../types/BindingMetadata.js'
import * as PModel from 'prosemirror-model'
import * as Y from 'yjs'
import { marksToAttributes } from './marksToAttributes.js'

export const createTypeFromTextNodes = (nodes: PModel.Node[], meta: BindingMetadata) => {
  const type = new Y.XmlText()
  const delta = nodes.map(node => ({
    insert: node.text ?? '',
    attributes: marksToAttributes(node.marks, meta),
  }))
  type.applyDelta(delta)
  meta.mapping.set(type, nodes)
  return type
}
