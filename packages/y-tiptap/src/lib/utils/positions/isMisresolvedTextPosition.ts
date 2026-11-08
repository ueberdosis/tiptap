import * as Y from 'yjs'

/** Detects a text position that resolved outside its original block. */
export const isMisresolvedTextPosition = (
  y: Y.Doc,
  relPos: Y.RelativePosition,
  absPos: number | null,
) => {
  if (absPos === null) {
    return false
  }
  const decoded = Y.createAbsolutePositionFromRelativePosition(relPos, y)
  // Yjs falls back to index 0 only when the text type itself was deleted.
  return (
    decoded !== null &&
    decoded.type instanceof Y.XmlText &&
    relPos.item !== null &&
    decoded.type._item?.deleted === true
  )
}
