import { Command, Commands, Range } from '../types'

declare module '@tiptap/core' {
  interface AllCommands {
    deleteRange: {
      /**
       * Delete a given range.
       */
      deleteRange: (range: Range) => Command,
    }
  }
}

export const deleteRange: Commands['deleteRange'] = range => ({ tr, dispatch }) => {
  const { from, to } = range

  if (dispatch) {
    tr.delete(from, to)
  }

  return true
}
