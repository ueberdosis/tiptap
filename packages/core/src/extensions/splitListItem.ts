import { splitListItem } from 'prosemirror-schema-list'
import { NodeType } from 'prosemirror-model'
import { Command } from '../Editor'
import { createExtension } from '../Extension'
import getNodeType from '../utils/getNodeType'

export const SplitListItem = createExtension({
  addCommands() {
    return {
      splitListItem: (typeOrName: string | NodeType): Command => ({ state, dispatch }) => {
        const type = getNodeType(typeOrName, state.schema)

        return splitListItem(type)(state, dispatch)
      },
    }
  },
})

declare module '../Editor' {
  interface AllExtensions {
    SplitListItem: typeof SplitListItem,
  }
}
