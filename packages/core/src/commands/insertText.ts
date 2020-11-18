import { Command } from '../types'

/**
 * Insert a string of text at the current position.
 */
export const insertText = (value: string): Command => ({ tr, dispatch }) => {
  if (dispatch) {
    tr.insertText(value)
  }

  return true
}
