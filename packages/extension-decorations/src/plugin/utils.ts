import { Node } from 'prosemirror-model'
import { Transaction } from 'prosemirror-state'
import { Decoration } from 'prosemirror-view'

import { PluginState, Position } from '../types'

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

export const stateReducer = (
  state: PluginState,
  action?: boolean,
): PluginState => {
  if (action === undefined) {
    return state
  }

  return { ...state, isActive: action }
}

type StepRange = [from: number, to: number];

export const getUpdatedRanges = ({ mapping }: Transaction): StepRange[] => {
  const ranges: StepRange[] = []

  mapping.maps.forEach((stepMap, i) => {
    stepMap.forEach((_oldStart, _oldEnd, newStart, newEnd) => {
      ranges.push([
        mapping.slice(i + 1).map(newStart),
        mapping.slice(i + 1).map(newEnd),
      ])
    })
  })

  return ranges
}
