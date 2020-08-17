import { Editor } from '../Editor'
import { selectAll } from 'prosemirror-commands'

type SelectAllCommand = () => Editor

declare module '../Editor' {
  interface Editor {
    selectAll: SelectAllCommand,
  }
}

export default (next: Function, { state, view }: Editor) => () => {
  selectAll(state, view.dispatch)
  next()
}
