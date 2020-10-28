import { EditorState } from 'prosemirror-state'
import { MarkType } from 'prosemirror-model'
import markHasAttributes from './markHasAttributes'

export default function markIsActive(state: EditorState, type: MarkType, attrs = {}) {
  const {
    from,
    $from,
    to,
    empty,
  } = state.selection

  const hasAttributes = markHasAttributes(state, type, attrs)

  if (empty) {
    return (type.isInSet(state.storedMarks || $from.marks()) && hasAttributes)
  }

  return (state.doc.rangeHasMark(from, to, type) && hasAttributes)
}
