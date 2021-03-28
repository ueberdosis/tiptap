import { MarkType } from 'prosemirror-model'
import { Command, RawCommands } from '../types'
import getMarkType from '../helpers/getMarkType'
import getMarkRange from '../helpers/getMarkRange'

declare module '@tiptap/core' {
  interface Commands {
    unsetMark: {
      /**
       * Remove all marks in the current selection.
       */
      unsetMark: (typeOrName: string | MarkType) => Command,
    }
  }
}

export const unsetMark: RawCommands['unsetMark'] = typeOrName => ({ tr, state, dispatch }) => {
  const { selection } = tr
  const type = getMarkType(typeOrName, state.schema)
  const { $from, empty, ranges } = selection

  if (dispatch) {
    if (empty) {
      let { from, to } = selection
      const range = getMarkRange($from, type)

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
  }

  return true
}
