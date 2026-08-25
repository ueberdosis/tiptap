/**
 * Closes active marks before rendering a non-text node.
 * Returns the closing markdown syntax and clears the active marks.
 */
export function closeMarksBeforeNode(
  activeMarks: Map<string, any>,
  getMarkClosing: (markType: string, mark: any) => string,
): string {
  let beforeMarkdown = ''
  Array.from(activeMarks.keys())
    .reverse()
    .forEach(markType => {
      const mark = activeMarks.get(markType)
      const closeMarkdown = getMarkClosing(markType, mark)
      if (closeMarkdown) {
        beforeMarkdown = closeMarkdown + beforeMarkdown
      }
    })
  activeMarks.clear()
  return beforeMarkdown
}
