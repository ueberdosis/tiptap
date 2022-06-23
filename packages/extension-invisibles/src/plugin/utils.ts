import { Node } from 'prosemirror-model'
import { Decoration, DecorationSet } from 'prosemirror-view'

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

export const createDeco = (pos: number, type: string) => {
  const newElement = document.createElement('span')

  newElement.classList.add('prosemirror--invisible')
  newElement.classList.add(`type-${type}`)

  return Decoration.widget(pos, newElement, {
    key: type,
    marks: [],
  })
}

export const characterFn = (type: string) => (predicate: (text: string) => boolean) => (from: number, to: number, doc: Node, decos: DecorationSet) => {
  const text = textBetween(from, to, doc)

  return text.reduce((decorations, currentPosition) => {
    return currentPosition.text.split('').reduce((innerDecorations, char, i) => {
      return predicate(char)
        ? innerDecorations.add(doc, [createDeco(currentPosition.pos + i, type)])
        : innerDecorations
    }, decorations)
  }, decos)
}

export const nodeFn = (
  type: string,
  toPosition: (node: Node, pos: number) => number,
) => (predicate: (node: Node) => boolean) => (
  from: number,
  to: number,
  doc: Node,
  decos: DecorationSet,
) => {
  let newDecos = decos

  doc.nodesBetween(from, to, (node, pos) => {
    if (predicate(node)) {
      const decoPos = toPosition(node, pos)
      const oldDecos = newDecos.find(
        decoPos,
        decoPos,
        spec => spec.key === type,
      )

      newDecos = newDecos
        .remove(oldDecos)
        .add(doc, [createDeco(decoPos, type)])
    }
  })
  return newDecos
}
