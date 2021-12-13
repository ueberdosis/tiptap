import { NodeType } from 'prosemirror-model'
import { setBlockType } from 'prosemirror-commands'
import { RawCommands } from '../types'
import { getNodeType } from '../helpers/getNodeType'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    setNode: {
      /**
       * Replace a given range with a node.
       */
      setNode: (typeOrName: string | NodeType, attributes?: Record<string, any>) => ReturnType,
    }
  }
}

export const setNode: RawCommands['setNode'] = (typeOrName, attributes = {}) => ({ state, dispatch, chain }) => {
  const type = getNodeType(typeOrName, state.schema)

  // TODO: use a fallback like insertContent?
  if (!type.isTextblock) {
    console.warn('[tiptap warn]: Currently "setNode()" only supports text block nodes.')

    return false
  }

  return chain()
    // try to convert node to default node if needed
    .command(({ commands }) => {
      const canSetBlock = setBlockType(type, attributes)(state)

      if (canSetBlock) {
        return true
      }

      return commands.clearNodes()
    })
    .command(({ state: updatedState }) => {
      return setBlockType(type, attributes)(updatedState, dispatch)
    })
    .run()
}
