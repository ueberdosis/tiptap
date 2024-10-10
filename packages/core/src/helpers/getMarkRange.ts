import { Mark as ProseMirrorMark, MarkType, ResolvedPos } from '@tiptap/pm/model'

import { Range } from '../types.js'
import { objectIncludes } from '../utilities/objectIncludes.js'

function findMarkInSet(
  marks: ProseMirrorMark[],
  type: MarkType,
  attributes: Record<string, any> = {},
): ProseMirrorMark | undefined {
  return marks.find(item => {
    return item.type === type && objectIncludes(item.attrs, attributes)
  })
}

function isMarkInSet(
  marks: ProseMirrorMark[],
  type: MarkType,
  attributes: Record<string, any> = {},
): boolean {
  return !!findMarkInSet(marks, type, attributes)
}

export function getMarkRange(
  $pos: ResolvedPos,
  type: MarkType,
  attributes: Record<string, any> = {},
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

  findMarkInSet([...start.node.marks], type, attributes)

  while (startIndex > 0 && mark.isInSet($pos.parent.child(startIndex - 1).marks)) {
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
