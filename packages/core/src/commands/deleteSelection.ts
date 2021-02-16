import { deleteSelection as originalDeleteSelection } from 'prosemirror-commands'
import { Command, Commands } from '../types'

declare module '@tiptap/core' {
  interface AllCommands {
    deleteSelection: {
      /**
       * Delete the selection, if there is one.
       */
      deleteSelection: () => Command,
    }
  }
}

export const deleteSelection: Commands['deleteSelection'] = () => ({ state, dispatch }) => {
  return originalDeleteSelection(state, dispatch)
}
