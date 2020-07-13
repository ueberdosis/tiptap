import { Editor } from '../Editor'
import { selectAll } from 'prosemirror-commands'

type SelectAll = () => any

declare module '../Editor' {
  interface Editor {
    selectAll: SelectAll,
  }
}

export default (next: Function, { state, view }: Editor): SelectAll => () => {
  selectAll(state, view.dispatch)
  next()
}
