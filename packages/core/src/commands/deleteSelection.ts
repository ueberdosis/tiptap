import { deleteSelection as originalDeleteSelection } from 'prosemirror-commands'
import { Command } from '../types'

/**
 * Delete the selection, if there is one.
 */
export const deleteSelection = (): Command => ({ state, dispatch }) => {
  return originalDeleteSelection(state, dispatch)
}
