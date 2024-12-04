import { Mark as ProseMirrorMark, MarkType, ResolvedPos } from '@tiptap/pm/model'

import { Range } from '../types.js'
import { objectIncludes } from '../utilities/objectIncludes.js'

function findMarkInSet(
  marks: ProseMirrorMark[],
  type: MarkType,
  attributes: Record<string, any> = {},
): ProseMirrorMark | undefined {
  return marks.find(item => {
    return (
      item.type === type
      && objectIncludes(
        // Only check equality for the attributes that are provided
        Object.fromEntries(Object.keys(attributes).map(k => [k, item.attrs[k]])),
        attributes,
      )
    )
  })
}

function isMarkInSet(
  marks: ProseMirrorMark[],
  type: MarkType,
  attributes: Record<string, any> = {},
): boolean {
  return !!findMarkInSet(marks, type, attributes)
}

/**
 * Get the range of a mark at a resolved position.
 */
export function getMarkRange(
  /**
   * The position to get the mark range for.
   */
  $pos: ResolvedPos,
  /**
   * The mark type to get the range for.
   */
  type: MarkType,
  /**
   * The attributes to match against.
   * If not provided, only the first mark at the position will be matched.
   */
  attributes?: Record<string, any>,
): Range | void {
  if (!$pos || !type) {
    return
  }
  let start = $pos.parent.childAfter($pos.parentOffset)

  // If the cursor is at the start of a text node that does not have the mark, look backward
  if (!start.node || !start.node.marks.some(mark => mark.type === type)) {
    start = $pos.parent.childBefore($pos.parentOffset)
  }

  // If there is no text node with the mark even backward, return undefined
  if (!start.node || !start.node.marks.some(mark => mark.type === type)) {
    return
  }

  // Default to only matching against the first mark's attributes
  attributes = attributes || start.node.marks[0]?.attrs

  // We now know that the cursor is either at the start, middle or end of a text node with the specified mark
  // so we can look it up on the targeted mark
  const mark = findMarkInSet([...start.node.marks], type, attributes)

  if (!mark) {
    return
  }

  let startIndex = start.index
  let startPos = $pos.start() + start.offset
  let endIndex = startIndex + 1
  let endPos = startPos + start.node.nodeSize

  while (
    startIndex > 0
    && isMarkInSet([...$pos.parent.child(startIndex - 1).marks], type, attributes)
  ) {
    startIndex -= 1
    startPos -= $pos.parent.child(startIndex).nodeSize
  }

  while (
    endIndex < $pos.parent.childCount
    && isMarkInSet([...$pos.parent.child(endIndex).marks], type, attributes)
  ) {
    endPos += $pos.parent.child(endIndex).nodeSize
    endIndex += 1
  }

  return {
    from: startPos,
    to: endPos,
  }
}
