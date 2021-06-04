import { deleteSelection as originalDeleteSelection } from 'prosemirror-commands'
import { RawCommands } from '../types'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    deleteSelection: {
      /**
       * Delete the selection, if there is one.
       */
      deleteSelection: () => ReturnType,
    }
  }
}

export const deleteSelection: RawCommands['deleteSelection'] = () => ({ state, dispatch }) => {
  return originalDeleteSelection(state, dispatch)
}
