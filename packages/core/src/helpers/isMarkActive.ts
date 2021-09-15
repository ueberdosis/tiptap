import { EditorState } from 'prosemirror-state'
import { MarkType } from 'prosemirror-model'
import objectIncludes from '../utilities/objectIncludes'
import getMarkType from './getMarkType'
import { MarkRange } from '../types'

export default function isMarkActive(
  state: EditorState,
  typeOrName: MarkType | string | null,
  attributes: Record<string, any> = {},
): boolean {
  const { from, to, empty } = state.selection
  const type = typeOrName
    ? getMarkType(typeOrName, state.schema)
    : null

  if (empty) {
    return !!(state.storedMarks || state.selection.$from.marks())
      .filter(mark => {
        if (!type) {
          return true
        }

        return type.name === mark.type.name
      })
      .find(mark => objectIncludes(mark.attrs, attributes, { strict: false }))
  }

  let selectionRange = 0
  let markRanges: MarkRange[] = []

  state.doc.nodesBetween(from, to, (node, pos) => {
    if (node.isText || node.marks.length) {
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

  if (selectionRange === 0) {
    return false
  }

  // calculate range of matched mark
  const matchedRange = markRanges
    .filter(markRange => {
      if (!type) {
        return true
      }

      return type.name === markRange.mark.type.name
    })
    .filter(markRange => objectIncludes(markRange.mark.attrs, attributes, { strict: false }))
    .reduce((sum, markRange) => {
      const size = markRange.to - markRange.from

      return sum + size
    }, 0)

  // calculate range of marks that excludes the searched mark
  // for example `code` doesn’t allow any other marks
  const excludedRange = markRanges
    .filter(markRange => {
      if (!type) {
        return true
      }

      return markRange.mark.type !== type
        && markRange.mark.type.excludes(type)
    })
    .reduce((sum, markRange) => {
      const size = markRange.to - markRange.from

      return sum + size
    }, 0)

  // we only include the result of `excludedRange`
  // if there is a match at all
  const range = matchedRange > 0
    ? matchedRange + excludedRange
    : matchedRange

  return range >= selectionRange
}
