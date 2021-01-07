import { joinForward as originalJoinForward } from 'prosemirror-commands'
import { Command } from '../types'

/**
 * Join two nodes forward.
 */
export const joinForward = (): Command => ({ state, dispatch }) => {
  return originalJoinForward(state, dispatch)
}
