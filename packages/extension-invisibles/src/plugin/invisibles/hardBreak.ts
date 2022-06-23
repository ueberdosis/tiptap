import { Node } from 'prosemirror-model'

import { nodeFn } from '../utils'

const isHardBreak = (node: Node) => {
  return node.type === node.type.schema.nodes.hardBreak
}

export const hardBreak = (predicate = isHardBreak) => nodeFn('break', (_, pos) => pos)(predicate)
