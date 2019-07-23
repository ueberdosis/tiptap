export default function getMarkRange($pos = null, type = null) {

  if (!$pos || !type) {
    return false
  }

  const start = $pos.parent.childAfter($pos.parentOffset)

  if (!start.node) {
    return false
  }

  const link = start.node.marks.find(mark => mark.type === type)
  if (!link) {
    return false
  }

  let startIndex = $pos.index()
  let startPos = $pos.start() + start.offset
  let endIndex = startIndex + 1
  let endPos = startPos + start.node.nodeSize

  while (startIndex > 0 && link.isInSet($pos.parent.child(startIndex - 1).marks)) {
    startIndex -= 1
    startPos -= $pos.parent.child(startIndex).nodeSize
  }

  while (endIndex < $pos.parent.childCount && link.isInSet($pos.parent.child(endIndex).marks)) {
    endPos += $pos.parent.child(endIndex).nodeSize
    endIndex += 1
  }

  return { from: startPos, to: endPos }

}
