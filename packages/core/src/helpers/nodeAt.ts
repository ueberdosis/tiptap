import type { Node as PMNode } from '@tiptap/pm/model'

/**
 * Like `doc.nodeAt(pos)`, but returns `null` for an out-of-range position
 * instead of throwing.
 */
export function nodeAt(doc: PMNode, pos: number): PMNode | null {
  if (pos < 0 || pos >= doc.content.size) {
    return null
  }

  return doc.nodeAt(pos)
}
