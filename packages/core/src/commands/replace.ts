import { NodeType } from 'prosemirror-model'
import { RawCommands } from '../types'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    replace: {
      /**
       * Replaces text with a node.
       */
      replace: (typeOrName: string | NodeType, attributes?: Record<string, any>) => ReturnType,
    }
  }
}

export const replace: RawCommands['replace'] = (typeOrName, attributes = {}) => ({ state, commands }) => {
  console.warn('[tiptap warn]: replace() is deprecated. please use insertContent() instead.')

  const { from, to } = state.selection
  const range = { from, to }

  return commands.replaceRange(range, typeOrName, attributes)
}
