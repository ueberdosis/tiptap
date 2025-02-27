import type { Range, RawCommands } from '../types.js'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    deleteRange: {
      /**
       * Delete a given range.
       * @param range The range to delete.
       * @example editor.commands.deleteRange({ from: 1, to: 3 })
       */
      deleteRange: (range: Range) => ReturnType
    }
  }
}

export const deleteRange: RawCommands['deleteRange'] =
  range =>
  ({ tr, dispatch }) => {
    const { from, to } = range

    if (dispatch) {
      tr.delete(from, to)
    }

    return true
  }
