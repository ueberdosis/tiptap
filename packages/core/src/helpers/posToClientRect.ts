import { EditorView } from 'prosemirror-view'
import coordsAtPos from './coordsAtPos'

export default function posToClientRect(view: EditorView, from: number, to: number): ClientRect {
  const start = coordsAtPos(view, from)
  const end = coordsAtPos(view, to, true)
  const top = Math.min(start.top, end.top)
  const bottom = Math.max(start.bottom, end.bottom)
  const left = Math.min(start.left, end.left)
  const right = Math.max(start.right, end.right)
  const width = right - left
  const height = bottom - top

  return {
    width,
    height,
    top,
    bottom,
    left,
    right,
  }
}
