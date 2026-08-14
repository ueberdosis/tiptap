import { attrsEqual } from '@tiptap/core'

import type { JSONMark } from '../types.js'

/**
 * Determines which marks need to open, treating same-type marks with
 * different attributes as distinct (close + reopen).
 * @param activeMarks The marks already open.
 * @param currentMarks The marks on the current text node.
 * @returns The marks that are not yet active, or whose attributes differ.
 * @example
 * const active = new Map([['bold', { type: 'bold' }]])
 * findMarksToOpen(active, new Map([['bold', { type: 'bold' }], ['italic', { type: 'italic' }]]))
 * // => [{ type: 'italic', mark: { type: 'italic' } }]
 */
export function findMarksToOpen(
  activeMarks: Map<string, JSONMark>,
  currentMarks: Map<string, JSONMark>,
): Array<{ type: string; mark: JSONMark }> {
  const marksToOpen: Array<{ type: string; mark: JSONMark }> = []
  Array.from(currentMarks.entries()).forEach(([markType, mark]) => {
    const activeMark = activeMarks.get(markType)

    // Open if the mark type is not active, or if the attributes differ
    if (!activeMark || !attrsEqual(activeMark.attrs, mark.attrs)) {
      marksToOpen.push({ type: markType, mark })
    }
  })
  return marksToOpen
}
