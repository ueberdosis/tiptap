import { attrsEqual } from '@tiptap/core'
import type { JSONContent } from '@tiptap/core'

import type { JSONMark } from '../types.js'

/**
 * Determines which marks to close at the node end, treating same-type marks
 * with different attributes as distinct (close + reopen).
 * @param activeMarks The marks currently open before this node.
 * @param currentMarks The marks on the current text node.
 * @param nextNode The following node, or null when this is the last node.
 * @param markSetsEqual Callback comparing two mark sets for equality.
 * @returns The mark types to close at the end of the current node.
 * @example
 * const active = new Map([['bold', { type: 'bold' }], ['italic', { type: 'italic' }]])
 * findMarksToCloseAtEnd(active, active, null, () => false)
 * // => ['italic', 'bold']  (all active marks close, LIFO)
 */
export function findMarksToCloseAtEnd(
  activeMarks: Map<string, JSONMark>,
  currentMarks: Map<string, JSONMark>,
  nextNode: JSONContent | null,
  markSetsEqual: (a: Map<string, JSONMark>, b: Map<string, JSONMark>) => boolean,
): string[] {
  const nextMarks = nextNode?.marks || []
  const nextMarksByType = new Map(nextMarks.map((mark: JSONMark) => [mark.type, mark]))

  if (!nextNode || nextMarks.length === 0) {
    return Array.from(activeMarks.keys()).reverse()
  }

  if (markSetsEqual(currentMarks, nextMarksByType)) {
    return []
  }

  return Array.from(activeMarks.entries())
    .reverse()
    .filter(([markType, activeMark]) => {
      const nextMark = nextMarksByType.get(markType)
      return !nextMark || !attrsEqual(nextMark.attrs, activeMark.attrs)
    })
    .map(([markType]) => markType)
}
