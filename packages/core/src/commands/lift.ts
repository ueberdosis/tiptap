import { NodeType } from '@tiptap/pm/model'
import { liftTarget } from '@tiptap/pm/transform'

import { getNodeType } from '../helpers/getNodeType.js'
import { isNodeActive } from '../helpers/isNodeActive.js'
import { RawCommands } from '../types.js'
import { isNumber } from '../utilities/isNumber.js'

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

export const lift: RawCommands['lift'] = (typeOrName, attributes = {}) => ({ state, tr, dispatch }) => {
  const type = getNodeType(typeOrName, state.schema)
  const isActive = isNodeActive(state, type, attributes)

  if (!isActive) {
    return false
  }

  const { $from, $to } = state.selection

  const range = $from.blockRange($to, node => node.type === type)

  if (range) {
    const target = liftTarget(range)

    if (isNumber(target)) {
      dispatch?.(tr.lift(range, target))
      return true
    }
  }

  return false
}
