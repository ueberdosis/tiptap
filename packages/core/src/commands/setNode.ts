import { setBlockType } from '@tiptap/pm/commands'
import type { NodeType } from '@tiptap/pm/model'

import { getNodeType } from '../helpers/getNodeType.js'
import type { RawCommands } from '../types.js'

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

export const setNode: RawCommands['setNode'] =
  (typeOrName, attributes = {}) =>
  ({ state, dispatch, chain }) => {
    const type = getNodeType(typeOrName, state.schema)

    let attributesToCopy: Record<string, any> | undefined

    if (state.selection.$anchor.sameParent(state.selection.$head)) {
      // only copy attributes if the selection is pointing to a node of the same type
      attributesToCopy = state.selection.$anchor.parent.attrs
    }

    // TODO: use a fallback like insertContent?
    if (!type.isTextblock) {
      console.warn('[tiptap warn]: Currently "setNode()" only supports text block nodes.')

      return false
    }

    return (
      chain()
        // try to convert node to default node if needed
        .command(({ commands }) => {
          const canSetBlock = setBlockType(type, { ...attributesToCopy, ...attributes })(state)

          if (canSetBlock) {
            return true
          }

          return commands.clearNodes()
        })
        .command(({ state: updatedState }) => {
          return setBlockType(type, { ...attributesToCopy, ...attributes })(updatedState, dispatch)
        })
        .run()
    )
  }
