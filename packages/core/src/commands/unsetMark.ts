import { MarkType } from 'prosemirror-model'
import { RawCommands } from '../types'
import { getMarkType } from '../helpers/getMarkType'
import { getMarkRange } from '../helpers/getMarkRange'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    unsetMark: {
      /**
       * Remove all marks in the current selection.
       */
      unsetMark: (
        typeOrName: string | MarkType,
        options?: {
          /**
           * Removes the mark even across the current selection. Defaults to `false`.
           */
          extendEmptyMarkRange?: boolean,
        },
      ) => ReturnType,
    }
  }
}

export const unsetMark: RawCommands['unsetMark'] = (typeOrName, options = {}) => ({ tr, state, dispatch }) => {
  const { extendEmptyMarkRange = false } = options
  const { selection } = tr
  const type = getMarkType(typeOrName, state.schema)
  const { $from, empty, ranges } = selection

  if (!dispatch) {
    return true
  }

  if (empty && extendEmptyMarkRange) {
    let { from, to } = selection
    const attrs = $from.marks().find(mark => mark.type === type)?.attrs
    const range = getMarkRange($from, type, attrs)

    if (range) {
      from = range.from
      to = range.to
    }

    tr.removeMark(from, to, type)
  } else {
    ranges.forEach(range => {
      tr.removeMark(range.$from.pos, range.$to.pos, type)
    })
  }

  tr.removeStoredMark(type)

  return true
}
