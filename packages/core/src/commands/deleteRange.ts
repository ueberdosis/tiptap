import { Command, Range } from '../types'

/**
 * Delete a given range.
 */
export const deleteRange = (range: Range): Command => ({ tr, dispatch }) => {
  const { from, to } = range

  if (dispatch) {
    tr.delete(from, to)
  }

  return true
}
