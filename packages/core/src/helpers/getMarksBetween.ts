import { EditorState } from 'prosemirror-state'
import { MarkRange } from '../types'

export default function getMarksBetween(from: number, to: number, state: EditorState): MarkRange[] {
  const marks: MarkRange[] = []

  state.doc.nodesBetween(from, to, (node, pos) => {
    marks.push(...node.marks.map(mark => ({
      from: pos,
      to: pos + node.nodeSize,
      mark,
    })))
  })

  return marks
}
