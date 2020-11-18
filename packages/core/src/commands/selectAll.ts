import { selectAll as originalSelectAll } from 'prosemirror-commands'
import { Command } from '../types'

/**
 * Select the whole document.
 */
export const selectAll = (): Command => ({ state, dispatch }) => {
  return originalSelectAll(state, dispatch)
}
