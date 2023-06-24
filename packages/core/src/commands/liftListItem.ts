import { NodeType } from '@tiptap/pm/model'
import { liftListItem as originalLiftListItem } from '@tiptap/pm/schema-list'

import { getActiveSplittableMarks } from '../helpers/getActiveSplittableMarks'
import { getNodeType } from '../helpers/getNodeType'
import { RawCommands } from '../types'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    liftListItem: {
      /**
       * Lift the list item into a wrapping list.
       */
      liftListItem: (typeOrName: string | NodeType) => ReturnType
    }
  }
}

export const liftListItem: RawCommands['liftListItem'] = typeOrName => ({
  state, dispatch, editor, chain,
}) => {
  const type = getNodeType(typeOrName, state.schema)

  const activeSplittableMarks = getActiveSplittableMarks(state, editor.extensionManager)

  return chain()
    .command(() => originalLiftListItem(type)(state, dispatch))
    .command(({ tr }) => {
      if (dispatch && activeSplittableMarks.length) {
        tr.ensureMarks(activeSplittableMarks)
      }
      return true
    }).run()
}
