import { lift as originalLift } from '@tiptap/pm/commands'
import { NodeType } from '@tiptap/pm/model'

import { getActiveSplittableMarks } from '../helpers/getActiveSplittableMarks'
import { getNodeType } from '../helpers/getNodeType'
import { isNodeActive } from '../helpers/isNodeActive'
import { RawCommands } from '../types'

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

export const lift: RawCommands['lift'] = (typeOrName, attributes = {}) => ({
  state, dispatch, editor, chain,
}) => {
  const type = getNodeType(typeOrName, state.schema)
  const isActive = isNodeActive(state, type, attributes)

  if (!isActive) {
    return false
  }

  const activeMarks = getActiveSplittableMarks(state, editor.extensionManager)

  return chain()
    .command(() => originalLift(state, dispatch))
    .command(({ tr }) => {
      if (dispatch && activeMarks.length) {
        tr.ensureMarks(activeMarks)
      }
      return true
    })
    .run()
}
