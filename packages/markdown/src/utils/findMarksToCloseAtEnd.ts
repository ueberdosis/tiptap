import { attrsEqual } from '@tiptap/core'

/**
 * Determines which marks to close at the node end, treating same-type marks
 * with different attributes as distinct (close + reopen).
 */
export function findMarksToCloseAtEnd(
  activeMarks: Map<string, any>,
  currentMarks: Map<string, any>,
  nextNode: any,
  markSetsEqual: (a: Map<string, { type: string }>, b: Map<string, { type: string }>) => boolean,
): string[] {
  const nextMarks = (nextNode?.marks as any[]) || []
  const nextMarksByType = new Map(nextMarks.map((mark: any) => [mark.type, mark]))

  if (!nextNode || nextMarks.length === 0) {
    return Array.from(activeMarks.keys()).reverse()
  }

  if (markSetsEqual(currentMarks, nextMarksByType)) {
    return []
  }

  return Array.from(activeMarks.entries())
    .reverse()
    .filter(([markType, activeMark]) => {
      const nextMark = nextMarksByType.get(markType)
      return !nextMark || !attrsEqual(nextMark.attrs, activeMark.attrs)
    })
    .map(([markType]) => markType)
}
