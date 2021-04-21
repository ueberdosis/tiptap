import { EditorView } from 'prosemirror-view'
import coordsAtPos from './coordsAtPos'

export default function posToDOMRect(view: EditorView, from: number, to: number): DOMRect {
  const start = coordsAtPos(view, from)
  const end = coordsAtPos(view, to, true)
  const top = Math.min(start.top, end.top)
  const bottom = Math.max(start.bottom, end.bottom)
  const left = Math.min(start.left, end.left)
  const right = Math.max(start.right, end.right)
  const width = right - left
  const height = bottom - top
  const x = left
  const y = top
  const data = {
    top,
    bottom,
    left,
    right,
    width,
    height,
    x,
    y,
  }

  return {
    ...data,
    toJSON: () => data,
  }
}
