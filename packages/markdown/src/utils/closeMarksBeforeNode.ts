import type { JSONMark } from '../types.js'

/**
 * Closes active marks before rendering a non-text node.
 * Returns the closing markdown syntax and clears the active marks.
 * @param activeMarks The marks to close.
 * @param getMarkClosing Returns the closing syntax for a mark.
 * @returns The concatenated closing syntax, innermost mark last.
 * @example
 * const active = new Map([['bold', { type: 'bold' }], ['italic', { type: 'italic' }]])
 * closeMarksBeforeNode(active, markType => (markType === 'bold' ? '**' : '*'))
 * // => '***'  (italic closes before bold, LIFO)
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
