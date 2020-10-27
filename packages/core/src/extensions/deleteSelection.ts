import { deleteSelection } from 'prosemirror-commands'
import { Command } from '../Editor'
import { createExtension } from '../Extension'

export const DeleteSelection = createExtension({
  addCommands() {
    return {
      deleteSelection: (): Command => ({ state, dispatch }) => {
        return deleteSelection(state, dispatch)
      },
    }
  },
})

declare module '../Editor' {
  interface AllExtensions {
    DeleteSelection: typeof DeleteSelection,
  }
}
