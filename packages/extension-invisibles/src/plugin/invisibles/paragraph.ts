import { Node } from 'prosemirror-model'

import { nodeFn } from '../utils'

const isParagraph = (node: Node) => {
  return node.type === node.type.schema.nodes.paragraph
}

export const paragraph = (predicate = isParagraph) => nodeFn('paragraph', (node, pos) => pos + node.nodeSize - 1)(predicate)
