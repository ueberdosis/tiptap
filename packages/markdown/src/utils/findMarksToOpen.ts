import { attrsEqual } from '@tiptap/core'

/**
 * Determines which marks need to open, treating same-type marks with
 * different attributes as distinct (close + reopen).
 */
export function findMarksToOpen(
  activeMarks: Map<string, any>,
  currentMarks: Map<string, any>,
): Array<{ type: string; mark: any }> {
  const marksToOpen: Array<{ type: string; mark: any }> = []
  Array.from(currentMarks.entries()).forEach(([markType, mark]) => {
    const activeMark = activeMarks.get(markType)

    // Open if the mark type is not active, or if the attributes differ
    if (!activeMark || !attrsEqual(activeMark.attrs, mark.attrs)) {
      marksToOpen.push({ type: markType, mark })
    }
  })
  return marksToOpen
}
