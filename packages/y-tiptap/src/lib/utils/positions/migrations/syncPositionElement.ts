import type { Node } from 'prosemirror-model'
import type { BindingMetadata } from '../../../../types/BindingMetadata.js'
import type { PositionNode } from '../../../../types/PositionMigration.js'
import * as Y from 'yjs'
import { createTypeFromTextOrElementNode } from '../../conversion/createTypeFromTextOrElementNode.js'
import { deleteMapping } from '../../binding/deleteMapping.js'

export const syncPositionElement = (
  parent: Y.XmlFragment,
  index: number,
  node: Node,
  position: number,
  sources: Map<string, PositionNode>,
  metadata: BindingMetadata,
) => {
  let element = parent.get(index)

  if (!(element instanceof Y.XmlElement) || !element._item) {
    throw new Error('Position migration requires synchronized elements')
  }

  const source = sources.get(`${element._item.id.client}:${element._item.id.clock}`)

  // Reconciliation may reuse an element for another node, which would redirect its anchors.
  if (source && source.position !== position) {
    deleteMapping(metadata.mapping, element)
    parent.delete(index, 1)
    element = createTypeFromTextOrElementNode(node, metadata)
    parent.insert(index, [element])
  }

  if (!(element instanceof Y.XmlElement) || !element._item) {
    throw new Error('Position migration requires integrated elements')
  }

  // Keep concurrent edits alive while giving new carets an unmigrated text anchor.
  if (
    source &&
    node.isTextblock &&
    node.content.size === 0 &&
    source.end !== position + node.nodeSize - 1 &&
    element.length === 0
  ) {
    element.insert(0, [new Y.XmlText()])
  }

  return element
}
