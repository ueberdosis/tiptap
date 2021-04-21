import { deleteSelection as originalDeleteSelection } from 'prosemirror-commands'
import { Command, RawCommands } from '../types'

declare module '@tiptap/core' {
  interface Commands {
    deleteSelection: {
      /**
       * Delete the selection, if there is one.
       */
      deleteSelection: () => Command,
    }
  }
}

export const deleteSelection: RawCommands['deleteSelection'] = () => ({ state, dispatch }) => {
  return originalDeleteSelection(state, dispatch)
}
