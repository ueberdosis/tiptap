import { Node } from 'prosemirror-model'
import { Decoration } from 'prosemirror-view'

import { Position } from '../types'

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

export const createDeco = (pos: number, type: string, content?: string) => {
  const newElement = document.createElement('span')

  newElement.classList.add('prosemirror--decorator')
  newElement.classList.add(`type-${type}`)
  Object.assign(newElement.style, {
    pointerEvents: 'none',
    userSelect: 'none',
  })

  if (content) {
    newElement.textContent = content
  }

  return Decoration.widget(pos, newElement, {
    key: type,
    marks: [],
  })
}
