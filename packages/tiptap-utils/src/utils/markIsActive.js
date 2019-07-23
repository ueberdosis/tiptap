export default function markIsActive(state, type) {
  const {
    from,
    $from,
    to,
    empty,
  } = state.selection

  if (empty) {
    return !!type.isInSet(state.storedMarks || $from.marks())
  }

  return !!state.doc.rangeHasMark(from, to, type)
}
