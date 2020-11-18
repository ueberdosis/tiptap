import { selectParentNode as originalSelectParentNode } from 'prosemirror-commands'
import { Command } from '../types'

/**
 * Select the parent node.
 */
export const selectParentNode = (): Command => ({ state, dispatch }) => {
  return originalSelectParentNode(state, dispatch)
}
