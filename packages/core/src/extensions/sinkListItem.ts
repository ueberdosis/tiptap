import { sinkListItem as originalSinkListItem } from 'prosemirror-schema-list'
import { NodeType } from 'prosemirror-model'
import { Command } from '../Editor'
import { createExtension } from '../Extension'
import getNodeType from '../utils/getNodeType'

export const SinkListItem = createExtension({
  addCommands() {
    return {
      sinkListItem: (typeOrName: string | NodeType): Command => ({ state, dispatch }) => {
        const type = getNodeType(typeOrName, state.schema)

        return originalSinkListItem(type)(state, dispatch)
      },
    }
  },
})

declare module '../Editor' {
  interface AllExtensions {
    SinkListItem: typeof SinkListItem,
  }
}
