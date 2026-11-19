import { type JSONContent, attrsEqual } from '@tiptap/core'

export function expelMarkWhitespace(nodes: JSONContent[]) {
  const pieces = nodes.flatMap((node, index) => {
    if (node.type !== 'text' || !node.marks?.length || !node.text) {
      return [{ node, index }]
    }

    const trimmed = node.text.trim()
    if (!trimmed || trimmed === node.text) {
      return [{ node, index }]
    }

    const start = node.text.length - node.text.trimStart().length
    const end = start + trimmed.length
    return [node.text.slice(0, start), trimmed, node.text.slice(end)]
      .filter(Boolean)
      .map(text => ({ node: { ...node, text }, index }))
  })

  // Keep a mark on whitespace only where the same mark continues on both sides.
  const trimMarks = (orderedPieces: typeof pieces) => {
    let continuing: NonNullable<JSONContent['marks']> = []

    for (const piece of orderedPieces) {
      const { node } = piece
      const marks = node.type === 'text' ? (node.marks ?? []) : []
      if (!marks.length || node.text?.trim()) {
        continuing = marks
        continue
      }

      continuing = marks.filter(mark =>
        continuing.some(other => mark.type === other.type && attrsEqual(mark.attrs, other.attrs)),
      )
      if (continuing.length !== marks.length) {
        piece.node = { ...node, marks: continuing }
      }
    }
  }

  trimMarks(pieces)
  trimMarks(pieces.slice().reverse())

  return pieces
}
