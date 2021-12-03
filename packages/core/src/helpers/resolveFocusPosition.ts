import { Node as ProseMirrorNode } from 'prosemirror-model'
import { Selection, TextSelection } from 'prosemirror-state'
import { FocusPosition } from '../types'
import minMax from '../utilities/minMax'

export default function resolveFocusPosition(
  doc: ProseMirrorNode, 
  position: FocusPosition = null
): Selection | null {

  if (!position) return null
  if (position === 'start' || position === true) return Selection.atStart(doc)
  if (position === 'end') return Selection.atEnd(doc)  
  if (position === 'all') return TextSelection.create(doc, 0, doc.content.size)

  // Check if `position` is in bounds of the doc if `position` is a number.
  const minPos = Selection.atStart(doc).from
  const maxPos = Selection.atEnd(doc).to
  const resolvedFrom = minMax(position, minPos, maxPos)
  const resolvedEnd = minMax(position, minPos, maxPos)  
  return TextSelection.create(doc, resolvedFrom, resolvedEnd)
}