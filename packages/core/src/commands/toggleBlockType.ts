import { NodeType } from 'prosemirror-model'
import { setBlockType } from 'prosemirror-commands'
import { Editor } from '../Editor'
import nodeIsActive from '../utils/nodeIsActive'

declare module '../Editor' {
  interface Editor {
    toggleBlockType(type: NodeType, toggleType: NodeType, attrs?: {}): Editor,
  }
}

export default function toggleBlockType(
  next: Function,
  editor: Editor,
  type: NodeType,
  toggleType: NodeType,
  attrs?: {},
): void {
  const { view, state } = editor
  const isActive = nodeIsActive(state, type, attrs)

  if (isActive) {
    setBlockType(toggleType)(view.state, view.dispatch)
    next()
    return
  }

  setBlockType(type, attrs)(view.state, view.dispatch)
  next()
}
