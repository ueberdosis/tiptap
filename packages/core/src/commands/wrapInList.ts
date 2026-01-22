import type { NodeType } from '@dibdab/pm/model'
import { wrapInList as originalWrapInList } from '@dibdab/pm/schema-list'

import { getNodeType } from '../helpers/getNodeType.js'
import type { CommandSpec } from '../types.js'

declare module '@dibdab/core' {
  interface Commands<ReturnType> {
    wrapInList: {
      /**
       * Wrap a node in a list.
       * @param typeOrName The type or name of the node.
       * @param attributes The attributes of the node.
       * @example editor.commands.wrapInList('bulletList')
       */
      wrapInList: (typeOrName: string | NodeType, attributes?: Record<string, any>) => ReturnType
    }
  }
}

export const wrapInList: CommandSpec =
  (typeOrName, attributes = {}) =>
  ({ state, dispatch }) => {
    const type = getNodeType(typeOrName, state.schema)

    return originalWrapInList(type, attributes)(state, dispatch)
  }
