import { EditorState } from 'prosemirror-state'
import { Mark, MarkType } from 'prosemirror-model'
import objectIncludes from '../utilities/objectIncludes'
import getMarkType from './getMarkType'
import { AnyObject } from '../types'

export type MarkRange = {
  mark: Mark,
  from: number,
  to: number,
}

export default function isMarkActive(
  state: EditorState,
  typeOrName: MarkType | string | null,
  attributes: AnyObject = {},
): boolean {
  const { from, to, empty } = state.selection
  const type = typeOrName
    ? getMarkType(typeOrName, state.schema)
    : null

  if (empty) {
    return !!state.selection.$head.marks()
      .filter(mark => {
        if (!type) {
          return true
        }

        return type.name === mark.type.name
      })
      .find(mark => objectIncludes(mark.attrs, attributes))
  }

  let selectionRange = 0
  let markRanges: MarkRange[] = []

  state.doc.nodesBetween(from, to, (node, pos) => {
    if (node.isInline) {
      const relativeFrom = Math.max(from, pos)
      const relativeTo = Math.min(to, pos + node.nodeSize)
      const range = relativeTo - relativeFrom

      selectionRange += range

      markRanges = [...markRanges, ...node.marks.map(mark => ({
        mark,
        from: relativeFrom,
        to: relativeTo,
      }))]
    }
  })

  const range = markRanges
    .filter(markRange => {
      if (!type) {
        return true
      }

      return type.name === markRange.mark.type.name
    })
    .filter(markRange => objectIncludes(markRange.mark.attrs, attributes))
    .reduce((sum, markRange) => {
      const size = markRange.to - markRange.from
      return sum + size
    }, 0)

  return selectionRange === range
}
