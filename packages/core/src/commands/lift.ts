import { lift as originalLift } from '@tiptap/pm/commands'
import { NodeType } from '@tiptap/pm/model'

import { getNodeType } from '../helpers/getNodeType.js'
import { isNodeActive } from '../helpers/isNodeActive.js'
import { RawCommands } from '../types.js'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    lift: {
      /**
       * Removes an existing wrap.
       */
      lift: (typeOrName: string | NodeType, attributes?: Record<string, any>) => ReturnType
    }
  }
}

export const lift: RawCommands['lift'] = (typeOrName, attributes = {}) => ({ state, dispatch }) => {
  const type = getNodeType(typeOrName, state.schema)
  const isActive = isNodeActive(state, type, attributes)

  if (!isActive) {
    return false
  }

  return originalLift(state, dispatch)
}
