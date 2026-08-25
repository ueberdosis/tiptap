import type { JSONMark } from '../types.js'

/**
 * Reopens marks after rendering a non-text node.
 * Returns the opening markdown syntax and adds the reopened marks to the active marks.
 * @param marksToReopen The marks to reopen on the following text.
 * @param activeMarks The marks to restore.
 * @param getMarkOpening Returns the opening syntax for a mark.
 * @returns The concatenated opening syntax.
 * @example
 * const active = new Map()
 * reopenMarksAfterNode(
 *   new Map([['bold', { type: 'bold' }], ['italic', { type: 'italic' }]]),
 *   active,
 *   () => '*',
 * )
 * // => '**'
 */
export function reopenMarksAfterNode(
  marksToReopen: Map<string, JSONMark>,
  activeMarks: Map<string, JSONMark>,
  getMarkOpening: (markType: string, mark: JSONMark) => string,
): string {
  let afterMarkdown = ''
  Array.from(marksToReopen.entries()).forEach(([markType, mark]) => {
    const openMarkdown = getMarkOpening(markType, mark)
    if (openMarkdown) {
      afterMarkdown += openMarkdown
    }
    activeMarks.set(markType, mark)
  })
  return afterMarkdown
}
