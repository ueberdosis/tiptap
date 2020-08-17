import { Editor } from '../Editor'
import { selectParentNode } from 'prosemirror-commands'

type SelectParentNodeCommand = () => Editor

declare module '../Editor' {
  interface Editor {
    selectParentNode: SelectParentNodeCommand,
  }
}

export default (next: Function, { state, view }: Editor) => () => {
  selectParentNode(state, view.dispatch)
  next()
}
