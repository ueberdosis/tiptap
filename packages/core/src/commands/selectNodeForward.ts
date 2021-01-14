import { selectNodeForward as originalSelectNodeForward } from 'prosemirror-commands'
import { Command } from '../types'

/**
 * Select a node forward.
 */
export const selectNodeForward = (): Command => ({ state, dispatch }) => {
  return originalSelectNodeForward(state, dispatch)
}
