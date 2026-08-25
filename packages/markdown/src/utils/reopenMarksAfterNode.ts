import type { JSONMark } from '../types.js'

/**
 * Reopens marks after rendering a non-text node.
 * Returns the opening markdown syntax and updates the active marks.
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
