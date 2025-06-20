import { Node } from '@tiptap/pm/model'

import { Position } from '../../types.js'

export const textBetween = (from: number, to: number, doc: Node) => {
  const positions: Position[] = []

  doc.nodesBetween(from, to, (node, pos) => {
    if (node.isText) {
      const offset = Math.max(from, pos) - pos

      positions.push({
        pos: pos + offset,
        text: node.text?.slice(offset, to - pos) || '',
      })
    }
  })

  return positions
}

export default textBetween
