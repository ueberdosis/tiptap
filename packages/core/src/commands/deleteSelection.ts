import { deleteSelection as originalDeleteSelection } from 'prosemirror-commands'
import { Command } from '../Editor'

type DeleteSelectionCommand = () => Command

declare module '../Editor' {
  interface Commands {
    deleteSelection: DeleteSelectionCommand,
  }
}

export const deleteSelection: DeleteSelectionCommand = () => ({ state, dispatch }) => {
  return originalDeleteSelection(state, dispatch)
}
