import type { Node as PMNode } from '@tiptap/pm/model'

export const getOuterNodePos = (doc: PMNode, pos: number): number => {
  const resolvedPos = doc.resolve(pos)
  const { depth } = resolvedPos

  if (depth === 0) {
    return pos
  }

  const a = resolvedPos.pos - resolvedPos.parentOffset

  return a - 1
}

export const getOuterNode = (doc: PMNode, pos: number): PMNode | null => {
  const node = doc.nodeAt(pos)
  const resolvedPos = doc.resolve(pos)

  let { depth } = resolvedPos
  let parent = node

  while (depth > 0) {
    const currentNode = resolvedPos.node(depth)

    depth -= 1

    if (depth === 0) {
      parent = currentNode
    }
  }

  return parent
}
