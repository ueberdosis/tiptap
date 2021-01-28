import { Mark } from 'prosemirror-model'
import { EditorState } from 'prosemirror-state'

export type MarkPosition = {
  mark: Mark,
  start: number,
  end: number,
}

export default function getMarksBetween(start: number, end: number, state: EditorState): MarkPosition[] {
  let marks: MarkPosition[] = []

  state.doc.nodesBetween(start, end, (node, pos) => {
    marks = [...marks, ...node.marks.map(mark => ({
      start: pos,
      end: pos + node.nodeSize,
      mark,
    }))]
  })

  return marks
}
