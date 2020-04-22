import { Editor } from '../Editor'
import { deleteSelection } from 'prosemirror-commands'

type DeleteSelection = () => any

declare module '../Editor' {
  interface Editor {
    deleteSelection: DeleteSelection,
  }
}

export default (next: Function, { state, view }: Editor): DeleteSelection => () => {
  deleteSelection(state, view.dispatch)
  next()
}
