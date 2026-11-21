import * as Y from 'yjs'
import type { BindingMetadata } from '../../../types/BindingMetadata.js'
import * as PModel from 'prosemirror-model'
import { createTypeFromTextNodes } from './createTypeFromTextNodes.js'
import { normalizePNodeContent } from './normalizePNodeContent.js'

export const createTypeFromTextOrElementNode = (
  node: PModel.Node | PModel.Node[],
  meta: BindingMetadata,
) =>
  node instanceof Array
    ? createTypeFromTextNodes(node, meta)
    : createTypeFromElementNode(node, meta)

const createTypeFromElementNode = (node: PModel.Node, meta: BindingMetadata) => {
  const type = new Y.XmlElement(node.type.name)
  for (const key in node.attrs) {
    const val = node.attrs[key]
    if (val !== null && key !== 'ychange') {
      type.setAttribute(key, val)
    }
  }
  type.insert(
    0,
    normalizePNodeContent(node).map(n => createTypeFromTextOrElementNode(n, meta)),
  )
  meta.mapping.set(type, node)
  return type
}
