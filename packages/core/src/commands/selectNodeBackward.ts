import { selectNodeBackward as originalSelectNodeBackward } from 'prosemirror-commands'
import { Command } from '../types'

/**
 * Select a node backward.
 */
export const selectNodeBackward = (): Command => ({ state, dispatch }) => {
  return originalSelectNodeBackward(state, dispatch)
}
