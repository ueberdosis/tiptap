import { Command } from '../types'

/**
 * Clear the whole document.
 */
export const clearContent = (emitUpdate: Boolean = false): Command => ({ commands }) => {
  return commands.setContent('', emitUpdate)
}
