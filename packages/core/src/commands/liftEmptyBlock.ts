import { liftEmptyBlock as originalLiftEmptyBlock } from 'prosemirror-commands'
import { Command } from '../types'

/**
 * Lift block if empty.
 */
export const liftEmptyBlock = (): Command => ({ state, dispatch }) => {
  return originalLiftEmptyBlock(state, dispatch)
}
