import { attrsEqual } from '@tiptap/core'

/**
 * Determines which marks to close based on the next node's marks,
 * treating same-type marks with different attributes as distinct.
 */
export function findMarksToClose(currentMarks: Map<string, any>, nextNode: any): string[] {
  const marksToClose: string[] = []

  Array.from(currentMarks.entries()).forEach(([markType, currentMark]) => {
    if (!nextNode) {
      marksToClose.push(markType)
      return
    }

    // Check if the next node has a mark of the same type with matching attributes
    const nextMark = (nextNode.marks || []).find(
      (mark: any) => mark.type === markType && attrsEqual(mark.attrs, currentMark.attrs),
    )

    if (!nextMark) {
      marksToClose.push(markType)
    }
  })
  return marksToClose
}
