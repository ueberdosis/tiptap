import type { JSONMark } from '../types.js'

/**
 * Closes active marks before rendering a non-text node.
 * Returns the closing markdown syntax and clears the active marks.
 */
export function closeMarksBeforeNode(
  activeMarks: Map<string, JSONMark>,
  getMarkClosing: (markType: string, mark: JSONMark) => string,
): string {
  let beforeMarkdown = ''
  Array.from(activeMarks.entries())
    .reverse()
    .forEach(([markType, mark]) => {
      const closeMarkdown = getMarkClosing(markType, mark)
      if (closeMarkdown) {
        beforeMarkdown = closeMarkdown + beforeMarkdown
      }
    })
  activeMarks.clear()
  return beforeMarkdown
}
