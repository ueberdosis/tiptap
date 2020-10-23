import { liftListItem as originalLiftListItem } from 'prosemirror-schema-list'
import { NodeType } from 'prosemirror-model'
import { Command } from '../Editor'
import { createExtension } from '../Extension'
import getNodeType from '../utils/getNodeType'

export const LiftListItem = createExtension({
  addCommands() {
    return {
      liftListItem: (typeOrName: string | NodeType): Command => ({ state, dispatch }) => {
        const type = getNodeType(typeOrName, state.schema)

        return originalLiftListItem(type)(state, dispatch)
      },
    }
  },
})

declare module '../Editor' {
  interface AllExtensions {
    LiftListItem: typeof LiftListItem,
  }
}
