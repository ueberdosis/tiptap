import type { Node as ProseMirrorNode } from '@tiptap/pm/model'

import type { NodeWithPos, Predicate, Range } from '../types.js'

/**
 * Same as `findChildren` but searches only within a `range`.
 * @param node The Prosemirror node to search in
 * @param range The range to search in
 * @param predicate The predicate to match
 * @returns An array of nodes with their positions
 */
export function findChildrenInRange(node: ProseMirrorNode, range: Range, predicate: Predicate): NodeWithPos[] {
  const nodesWithPos: NodeWithPos[] = []

  // if (range.from === range.to) {
  //   const nodeAt = node.nodeAt(range.from)

  //   if (nodeAt) {
  //     nodesWithPos.push({
  //       node: nodeAt,
  //       pos: range.from,
  //     })
  //   }
  // }

  node.nodesBetween(range.from, range.to, (child, pos) => {
    if (predicate(child)) {
      nodesWithPos.push({
        node: child,
        pos,
      })
    }
  })

  return nodesWithPos
}
