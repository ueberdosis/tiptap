import { EditorState } from 'prosemirror-state'
import { Mark, MarkType } from 'prosemirror-model'
import objectIncludes from '../utilities/objectIncludes'
import getMarkType from '../helpers/getMarkType'

export default function markIsActive(state: EditorState, typeOrName: MarkType | string | null, attributes = {}) {
  const { from, to, empty } = state.selection
  const type = typeOrName
    ? getMarkType(typeOrName, state.schema)
    : null

  let marks: Mark[] = []

  if (empty) {
    marks = state.selection.$head.marks()
  } else {
    state.doc.nodesBetween(from, to, node => {
      marks = [...marks, ...node.marks]
    })
  }

  const markWithAttributes = marks
    .filter(mark => {
      if (!type) {
        return true
      }

      return type.name === mark.type.name
    })
    .find(mark => objectIncludes(mark.attrs, attributes))

  return !!markWithAttributes
}
