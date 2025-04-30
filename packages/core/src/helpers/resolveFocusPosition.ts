import type { Node as ProseMirrorNode } from '@tiptap/pm/model'
import { Selection, TextSelection } from '@tiptap/pm/state'

import type { FocusPosition } from '../types.js'
import { minMax } from '../utilities/minMax.js'

export function resolveFocusPosition(doc: ProseMirrorNode, position: FocusPosition = null): Selection | null {
  if (!position) {
    return null
  }

  const selectionAtStart = Selection.atStart(doc)
  const selectionAtEnd = Selection.atEnd(doc)

  if (position === 'start' || position === true) {
    return selectionAtStart
  }

  if (position === 'end') {
    return selectionAtEnd
  }

  const minPos = selectionAtStart.from
  const maxPos = selectionAtEnd.to

  if (position === 'all') {
    return TextSelection.create(doc, minMax(0, minPos, maxPos), minMax(doc.content.size, minPos, maxPos))
  }

  return TextSelection.create(doc, minMax(position, minPos, maxPos), minMax(position, minPos, maxPos))
}
