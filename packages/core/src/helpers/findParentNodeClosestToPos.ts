import { Node as ProseMirrorNode, ResolvedPos } from '@tiptap/pm/model'

import { Predicate } from '../types.js'

export function findParentNodeClosestToPos(
  $pos: ResolvedPos,
  predicate: Predicate,
):
  | {
      pos: number
      start: number
      depth: number
      node: ProseMirrorNode
    }
  | undefined {
  for (let i = $pos.depth; i > 0; i -= 1) {
    const node = $pos.node(i)

    if (predicate(node)) {
      return {
        pos: i > 0 ? $pos.before(i) : 0,
        start: $pos.start(i),
        depth: i,
        node,
      }
    }
  }
}
