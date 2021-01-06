import { joinBackward as originalJoinBackward } from 'prosemirror-commands'
import { Command } from '../types'

/**
 * Join two nodes backward.
 */
export const joinBackward = (): Command => ({ state, dispatch }) => {
  return originalJoinBackward(state, dispatch)
}
