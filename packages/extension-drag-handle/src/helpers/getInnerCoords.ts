import type { EditorView } from '@tiptap/pm/view'

import { getComputedStyle } from './getComputedStyle.js'
import { minMax } from './minMax.js'

export function getInnerCoords(view: EditorView, x: number, y: number): { left: number; top: number } {
  const paddingLeft = parseInt(getComputedStyle(view.dom, 'paddingLeft'), 10)
  const paddingRight = parseInt(getComputedStyle(view.dom, 'paddingRight'), 10)
  const borderLeft = parseInt(getComputedStyle(view.dom, 'borderLeftWidth'), 10)
  const borderRight = parseInt(getComputedStyle(view.dom, 'borderLeftWidth'), 10)
  const bounds = view.dom.getBoundingClientRect()
  const coords = {
    left: minMax(x, bounds.left + paddingLeft + borderLeft, bounds.right - paddingRight - borderRight),
    top: y,
  }

  return coords
}
