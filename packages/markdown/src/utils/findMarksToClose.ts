import { attrsEqual } from '@tiptap/core'
import type { JSONContent } from '@tiptap/core'

import type { JSONMark } from '../types.js'

/**
 * Determines which marks to close based on the next node's marks,
 * treating same-type marks with different attributes as distinct.
 * @param currentMarks The marks on the current text node.
 * @param nextNode The following node, or null when this is the last node.
 * @returns The mark types that do not continue on the next node.
 * @example
 * findMarksToClose(new Map([['bold', { type: 'bold' }]]), null)
 * // => ['bold']
 * findMarksToClose(new Map([['bold', { type: 'bold' }]]), {
 *   type: 'text',
 *   text: 'x',
 *   marks: [{ type: 'bold' }],
 * })
 * // => []  (bold continues on the next node)
 */
export function findMarksToClose(
  currentMarks: Map<string, JSONMark>,
  nextNode: JSONContent | null,
): string[] {
  const marksToClose: string[] = []

  Array.from(currentMarks.entries()).forEach(([markType, currentMark]) => {
    if (!nextNode) {
      marksToClose.push(markType)
      return
    }

    // Check if the next node has a mark of the same type with matching attributes
    const nextMark = (nextNode.marks || []).find(
      (mark: JSONMark) => mark.type === markType && attrsEqual(mark.attrs, currentMark.attrs),
    )

    if (!nextMark) {
      marksToClose.push(markType)
    }
  })
  return marksToClose
}
