import type { ResolvedPos } from 'prosemirror-model'
import { Node } from 'prosemirror-model'

export const remapIntoBlock = ($oldPos: ResolvedPos, newBlockStart: number, newBlock: Node) => {
  let pos = newBlockStart + 1
  let node = newBlock
  for (let depth = 1; depth < $oldPos.depth; depth++) {
    const idx = $oldPos.index(depth)
    if (idx >= node.childCount) {
      return null
    }
    for (let i = 0; i < idx; i++) {
      pos += node.child(i).nodeSize
    }
    pos += 1
    node = node.child(idx)
    if (node.type !== $oldPos.node(depth + 1).type) {
      return null
    }
  }
  if (!node.isTextblock) {
    return null
  }
  return pos + Math.min($oldPos.parentOffset, node.content.size)
}
