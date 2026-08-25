import { attrsEqual } from '@tiptap/core'
import type { JSONContent } from '@tiptap/core'

import type { JSONMark } from '../types.js'

/**
 * Determines which marks to close at the node end, treating same-type marks
 * with different attributes as distinct (close + reopen).
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
