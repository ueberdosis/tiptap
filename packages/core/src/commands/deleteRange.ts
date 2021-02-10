import { Command, Commands, Range } from '../types'

/**
 * Delete a given range.
 */
export const deleteRange: Commands['deleteRange'] = range => ({ tr, dispatch }) => {
  const { from, to } = range

  if (dispatch) {
    tr.delete(from, to)
  }

  return true
}

declare module '@tiptap/core' {
  interface Commands {
    deleteRange: (range: Range) => Command,
  }
}
