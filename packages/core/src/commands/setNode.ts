import { setBlockType } from '@tiptap/pm/commands'
import { NodeType } from '@tiptap/pm/model'

import { getNodeType } from '../helpers/getNodeType.js'
import { RawCommands } from '../types.js'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    setNode: {
      /**
       * Replace a given range with a node.
       * @param typeOrName The type or name of the node
       * @param attributes The attributes of the node
       * @example editor.commands.setNode('paragraph')
       */
      setNode: (typeOrName: string | NodeType, attributes?: Record<string, any>) => ReturnType
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

  return (
    chain()
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
  )
}
