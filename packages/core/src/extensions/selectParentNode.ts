import { selectParentNode } from 'prosemirror-commands'
import { Command } from '../Editor'
import { createExtension } from '../Extension'

export const SelectParentNode = createExtension({
  addCommands() {
    return {
      selectParentNode: (): Command => ({ state, dispatch }) => {
        return selectParentNode(state, dispatch)
      },
    }
  },
})

declare module '../Editor' {
  interface AllExtensions {
    SelectParentNode: typeof SelectParentNode,
  }
}
