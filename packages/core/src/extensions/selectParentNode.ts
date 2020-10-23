import { selectParentNode as originalSelectParentNode } from 'prosemirror-commands'
import { Command } from '../Editor'
import { createExtension } from '../Extension'

export const SelectParentNode = createExtension({
  addCommands() {
    return {
      selectParentNode: (): Command => ({ state, dispatch }) => {
        return originalSelectParentNode(state, dispatch)
      },
    }
  },
})

declare module '../Editor' {
  interface AllExtensions {
    SelectParentNode: typeof SelectParentNode,
  }
}
