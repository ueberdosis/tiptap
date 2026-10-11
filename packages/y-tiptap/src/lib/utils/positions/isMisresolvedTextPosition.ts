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
  return (
    decoded !== null && decoded.type instanceof Y.XmlText && relPos.item !== null && absPos <= 1
  )
}
