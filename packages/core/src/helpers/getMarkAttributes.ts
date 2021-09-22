import { EditorState } from 'prosemirror-state'
import { Mark, MarkType } from 'prosemirror-model'
import getMarkType from './getMarkType'

export default function getMarkAttributes(state: EditorState, typeOrName: string | MarkType): Record<string, any> {
  const type = getMarkType(typeOrName, state.schema)
  const { from, to, empty } = state.selection
  const marks: Mark[] = []

  if (empty) {
    marks.push(...state.selection.$head.marks())
  } else {
    state.doc.nodesBetween(from, to, node => {
      marks.push(...node.marks)
    })
  }

  const mark = marks.find(markItem => markItem.type.name === type.name)

  if (mark) {
    return { ...mark.attrs }
  }

  return {}
}
