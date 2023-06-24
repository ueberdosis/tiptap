import { NodeType } from '@tiptap/pm/model'
import { wrapInList as originalWrapInList } from '@tiptap/pm/schema-list'

import { getActiveSplittableMarks } from '../helpers/getActiveSplittableMarks'
import { getNodeType } from '../helpers/getNodeType'
import { RawCommands } from '../types'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    wrapInList: {
      /**
       * Wrap a node in a list.
       */
      wrapInList: (typeOrName: string | NodeType, attributes?: Record<string, any>) => ReturnType
    }
  }
}

export const wrapInList: RawCommands['wrapInList'] = (typeOrName, attributes = {}) => ({
  state, dispatch, chain, editor,
}) => {
  const type = getNodeType(typeOrName, state.schema)

  const activeMarks = getActiveSplittableMarks(state, editor.extensionManager)

  return chain()
    .command(() => originalWrapInList(type, attributes)(state, dispatch))
    .command(({ tr }) => {
      if (dispatch && activeMarks.length) {
        tr.ensureMarks(activeMarks)
      }
      return true
    })
    .run()
}
