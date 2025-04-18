import { lift as originalLift } from '@tiptap/pm/commands'
import type { NodeType } from '@tiptap/pm/model'

import { getNodeType } from '../helpers/getNodeType.js'
import { isNodeActive } from '../helpers/isNodeActive.js'
import type { RawCommands } from '../types.js'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    lift: {
      /**
       * Removes an existing wrap if possible lifting the node out of it
       * @param typeOrName The type or name of the node.
       * @param attributes The attributes of the node.
       * @example editor.commands.lift('paragraph')
       * @example editor.commands.lift('heading', { level: 1 })
       */
      lift: (typeOrName: string | NodeType, attributes?: Record<string, any>) => ReturnType
    }
  }
}

export const lift: RawCommands['lift'] =
  (typeOrName, attributes = {}) =>
  ({ state, dispatch }) => {
    const type = getNodeType(typeOrName, state.schema)
    const isActive = isNodeActive(state, type, attributes)

    if (!isActive) {
      return false
    }

    return originalLift(state, dispatch)
  }
