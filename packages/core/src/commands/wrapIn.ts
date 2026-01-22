import { wrapIn as originalWrapIn } from '@dibdab/pm/commands'
import type { NodeType } from '@dibdab/pm/model'

import { getNodeType } from '../helpers/getNodeType.js'
import type { CommandSpec } from '../types.js'

declare module '@dibdab/core' {
  interface Commands<ReturnType> {
    wrapIn: {
      /**
       * Wraps nodes in another node.
       * @param typeOrName The type or name of the node.
       * @param attributes The attributes of the node.
       * @example editor.commands.wrapIn('blockquote')
       */
      wrapIn: (typeOrName: string | NodeType, attributes?: Record<string, any>) => ReturnType
    }
  }
}

export const wrapIn: CommandSpec =
  (typeOrName, attributes = {}) =>
  ({ state, dispatch }) => {
    const type = getNodeType(typeOrName, state.schema)

    return originalWrapIn(type, attributes)(state, dispatch)
  }
