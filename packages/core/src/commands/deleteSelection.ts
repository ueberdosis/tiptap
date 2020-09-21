import { Command } from '../Editor'
import { deleteSelection as originalDeleteSelection } from 'prosemirror-commands'

type DeleteSelectionCommand = () => Command

declare module '../Editor' {
  interface Editor {
    deleteSelection: DeleteSelectionCommand,
  }
}

export const deleteSelection: DeleteSelectionCommand = () => ({ state, dispatch }) => {
  return originalDeleteSelection(state, dispatch)
}
