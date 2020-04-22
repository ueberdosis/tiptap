import { Editor } from '../Editor'
import { selectParentNode } from 'prosemirror-commands'

type SelectParentNode = () => any

declare module '../Editor' {
  interface Editor {
    selectParentNode: SelectParentNode,
  }
}

export default (next: Function, { state, view }: Editor): SelectParentNode => () => {
  selectParentNode(state, view.dispatch)
  next()
}
