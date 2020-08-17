import { Editor } from '../Editor'
import { deleteSelection } from 'prosemirror-commands'

type DeleteSelectionCommand = () => Editor

declare module '../Editor' {
  interface Editor {
    deleteSelection: DeleteSelectionCommand,
  }
}

export default (next: Function, { state, view }: Editor) => () => {
  deleteSelection(state, view.dispatch)
  next()
}
