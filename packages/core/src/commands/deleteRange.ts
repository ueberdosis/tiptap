import { Command, RawCommands, Range } from '../types'

declare module '@tiptap/core' {
  interface Commands {
    deleteRange: {
      /**
       * Delete a given range.
       */
      deleteRange: (range: Range) => Command,
    }
  }
}

export const deleteRange: RawCommands['deleteRange'] = range => ({ tr, dispatch }) => {
  const { from, to } = range

  if (dispatch) {
    tr.delete(from, to)
  }

  return true
}
