import { Command } from '../types'

/**
 * Scroll the selection into view.
 */
export const scrollIntoView = (): Command => ({ tr, dispatch }) => {
  if (dispatch) {
    tr.scrollIntoView()
  }

  return true
}
