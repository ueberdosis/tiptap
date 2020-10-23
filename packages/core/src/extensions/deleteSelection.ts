import { deleteSelection as originalDeleteSelection } from 'prosemirror-commands'
import { Command } from '../Editor'
import { createExtension } from '../Extension'

export const DeleteSelection = createExtension({
  addCommands() {
    return {
      deleteSelection: (): Command => ({ state, dispatch }) => {
        return originalDeleteSelection(state, dispatch)
      },
    }
  },
})

declare module '../Editor' {
  interface AllExtensions {
    DeleteSelection: typeof DeleteSelection,
  }
}
