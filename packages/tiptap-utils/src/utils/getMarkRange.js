export default function ($pos = null, type = null) {

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
  while (startIndex > 0 && link.isInSet($pos.parent.child(startIndex - 1).marks)) {
    startIndex -= 1
    startPos -= $pos.parent.child(startIndex).nodeSize
  }

  const endIndex = $pos.indexAfter()
  const endPos = startPos + start.node.nodeSize

  // disable for now. see #156
  // while (endIndex < $pos.parent.childCount && link.isInSet($pos.parent.child(endIndex).marks)) {
  //   endPos += $pos.parent.child(endIndex).nodeSize
  //   endIndex += 1
  // }

  return { from: startPos, to: endPos }

}
