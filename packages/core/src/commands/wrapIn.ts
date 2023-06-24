import { wrapIn as originalWrapIn } from '@tiptap/pm/commands'
import { NodeType } from '@tiptap/pm/model'

import { getActiveSplittableMarks } from '../helpers/getActiveSplittableMarks'
import { getNodeType } from '../helpers/getNodeType'
import { RawCommands } from '../types'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    wrapIn: {
      /**
       * Wraps nodes in another node.
       */
      wrapIn: (typeOrName: string | NodeType, attributes?: Record<string, any>) => ReturnType
    }
  }
}

export const wrapIn: RawCommands['wrapIn'] = (typeOrName, attributes = {}) => ({
  state, dispatch, chain, editor,
}) => {
  const type = getNodeType(typeOrName, state.schema)

  const activeMarks = getActiveSplittableMarks(state, editor.extensionManager)

  return chain()
    .command(() => originalWrapIn(type, attributes)(state, dispatch))
    .command(({ tr }) => {
      if (dispatch && activeMarks.length) {
        tr.ensureMarks(activeMarks)
      }
      return true
    })
    .run()
}
