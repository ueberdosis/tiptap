import type { Node as PMNode } from '@tiptap/pm/model'

/**
 * Checks if a whole node lies between two positions.
 * Nodes that only open or close in the range, like the parents of two textblocks, do not count.
 * @param doc The document to check.
 * @param from The start of the range.
 * @param to The end of the range.
 * @returns Whether a node lies fully inside the range.
 */
export function hasBlockBetween(doc: PMNode, from: number, to: number): boolean {
  let found = false

  doc.nodesBetween(from, to, (node, pos) => {
    if (found) {
      return false
    }

    if (pos >= from && pos + node.nodeSize <= to) {
      found = true
      return false
    }

    return true
  })

  return found
}
