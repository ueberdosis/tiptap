import { RawCommands } from '../types'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    unsetAllMarks: {
      /**
       * Remove all marks in the current selection.
       */
      unsetAllMarks: () => ReturnType,
    }
  }
}

export const unsetAllMarks: RawCommands['unsetAllMarks'] = () => ({ tr, dispatch }) => {
  const { selection } = tr
  const { empty, ranges } = selection

  if (empty) {
    return true
  }

  if (dispatch) {
    ranges.forEach(range => {
      tr.removeMark(range.$from.pos, range.$to.pos)
    })
  }

  return true
}
