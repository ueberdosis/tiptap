import { NodeType } from 'prosemirror-model'
import { Command, Commands, AnyObject } from '../types'

/**
 * Replaces text with a node.
 */
export const replace: Commands['replace'] = (typeOrName, attributes = {}) => ({ state, commands }) => {
  const { from, to } = state.selection
  const range = { from, to }

  return commands.replaceRange(range, typeOrName, attributes)
}

declare module '@tiptap/core' {
  interface Commands {
    replace: (typeOrName: string | NodeType, attributes?: AnyObject) => Command,
  }
}
