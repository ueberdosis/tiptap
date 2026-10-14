import { Node } from 'prosemirror-model'
import { attrsEqual } from './attrsEqual.js'
import { findAbsolutePositionAfterStructuralChange } from './findAbsolutePositionAfterStructuralChange.js'

/** Detects a position that moved into a different block. */
export const isMisresolvedAfterStructuralChange = (
  oldDoc: Node,
  newDoc: Node,
  oldAbs: number,
  resolvedAbs: number | null,
) => {
  if (resolvedAbs === null) {
    return false
  }
  const $old = oldDoc.resolve(oldAbs)
  const $new = newDoc.resolve(resolvedAbs)
  if (!$old.parent.isTextblock) {
    return false
  }
  if (!$new.parent.isTextblock) {
    return true
  }
  if ($old.parent.textContent !== $new.parent.textContent) {
    return true
  }
  if ($old.parentOffset !== 0 && $new.parentOffset === 0) {
    return true
  }
  const bothAtStart = $old.parentOffset === 0 && $new.parentOffset === 0
  const suspicious =
    $old.parentOffset !== $new.parentOffset ||
    $old.parent.type !== $new.parent.type ||
    !attrsEqual($old.parent.attrs, $new.parent.attrs)
  if (bothAtStart || suspicious) {
    const expected = findAbsolutePositionAfterStructuralChange(oldDoc, newDoc, oldAbs)
    return expected !== null && expected !== resolvedAbs
  }
  return false
}
