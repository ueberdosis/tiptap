import { NodeType } from 'prosemirror-model'
import { Command, AnyObject } from '../types'

/**
 * Replaces text with a node.
 */
export const replace = (typeOrName: string | NodeType, attributes: AnyObject = {}): Command => ({ state, commands }) => {
  const { from, to } = state.selection
  const range = { from, to }

  return commands.replaceRange(range, typeOrName, attributes)
}
