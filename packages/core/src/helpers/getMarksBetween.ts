import { EditorState } from 'prosemirror-state'
import { MarkRange } from '../types'

export default function getMarksBetween(from: number, to: number, state: EditorState): MarkRange[] {
  let marks: MarkRange[] = []

  state.doc.nodesBetween(from, to, (node, pos) => {
    marks = [...marks, ...node.marks.map(mark => ({
      from: pos,
      to: pos + node.nodeSize,
      mark,
    }))]
  })

  return marks
}
