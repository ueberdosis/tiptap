import { selectAll as originalSelectAll } from 'prosemirror-commands'
import { Command } from '../Editor'
import { createExtension } from '../Extension'

export const SelectAll = createExtension({
  addCommands() {
    return {
      selectAll: (): Command => ({ state, dispatch }) => {
        return originalSelectAll(state, dispatch)
      },
    }
  },
})

declare module '../Editor' {
  interface AllExtensions {
    SelectAll: typeof SelectAll,
  }
}
