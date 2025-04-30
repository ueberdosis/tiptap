import type { Node as ProseMirrorNode } from '@tiptap/pm/model'

import type { NodeWithPos, Predicate } from '../types.js'

/**
 * Find children inside a Prosemirror node that match a predicate.
 * @param node The Prosemirror node to search in
 * @param predicate The predicate to match
 * @returns An array of nodes with their positions
 */
export function findChildren(node: ProseMirrorNode, predicate: Predicate): NodeWithPos[] {
  const nodesWithPos: NodeWithPos[] = []

  node.descendants((child, pos) => {
    if (predicate(child)) {
      nodesWithPos.push({
        node: child,
        pos,
      })
    }
  })

  return nodesWithPos
}
