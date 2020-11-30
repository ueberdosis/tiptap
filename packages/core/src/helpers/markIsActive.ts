import { EditorState } from 'prosemirror-state'
import { MarkType } from 'prosemirror-model'
import markHasAttributes from './markHasAttributes'

export default function markIsActive(state: EditorState, type: MarkType, attributes = {}) {
  const {
    from,
    $from,
    to,
    empty,
  } = state.selection

  const hasMark = empty
    ? !!(type.isInSet(state.storedMarks || $from.marks()))
    : state.doc.rangeHasMark(from, to, type)

  const hasAttributes = markHasAttributes(state, type, attributes)

  return hasMark && hasAttributes
}
