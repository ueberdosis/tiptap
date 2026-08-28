import type { Node as PMNode } from '@tiptap/pm/model'

/**
 * Like `doc.nodeAt(pos)`, but returns `null` for an out-of-range position
 * instead of throwing.
 *
 * @param doc The document to read from.
 * @param pos The absolute position to look up.
 * @returns The node at `pos`, or `null` if out of range.
 */
export function nodeAt(doc: PMNode, pos: number): PMNode | null {
  if (pos < 0 || pos >= doc.content.size) {
    return null
  }

  return doc.nodeAt(pos)
}
