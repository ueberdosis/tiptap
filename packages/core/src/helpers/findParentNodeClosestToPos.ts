import { ResolvedPos, Node as ProseMirrorNode } from 'prosemirror-model'
import { Predicate } from '../types'

export default function findParentNodeClosestToPos($pos: ResolvedPos, predicate: Predicate): ({
  pos: number,
  start: number,
  depth: number,
  node: ProseMirrorNode,
} | undefined) {
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
