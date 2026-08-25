/**
 * Reopens marks after rendering a non-text node.
 * Returns the opening markdown syntax and updates the active marks.
 */
export function reopenMarksAfterNode(
  marksToReopen: Map<string, any>,
  activeMarks: Map<string, any>,
  getMarkOpening: (markType: string, mark: any) => string,
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
