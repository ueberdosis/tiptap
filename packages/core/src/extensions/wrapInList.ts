import { wrapInList } from 'prosemirror-schema-list'
import { NodeType } from 'prosemirror-model'
import { Command } from '../Editor'
import { createExtension } from '../Extension'
import getNodeType from '../utils/getNodeType'

export const WrapInList = createExtension({
  addCommands() {
    return {
      wrapInList: (typeOrName: string | NodeType, attrs?: {}): Command => ({ state, dispatch }) => {
        const type = getNodeType(typeOrName, state.schema)

        return wrapInList(type, attrs)(state, dispatch)
      },
    }
  },
})

declare module '../Editor' {
  interface AllExtensions {
    WrapInList: typeof WrapInList,
  }
}
