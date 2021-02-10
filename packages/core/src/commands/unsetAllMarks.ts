import { Command, Commands } from '../types'

/**
 * Remove all marks in the current selection.
 */
export const unsetAllMarks: Commands['unsetAllMarks'] = () => ({ tr, state, dispatch }) => {
  const { selection } = tr
  const { from, to, empty } = selection

  if (empty) {
    return true
  }

  if (dispatch) {
    Object
      .entries(state.schema.marks)
      .forEach(([, mark]) => {
        tr.removeMark(from, to, mark as any)
      })
  }

  return true
}

declare module '@tiptap/core' {
  interface Commands {
    unsetAllMarks: () => Command,
  }
}
