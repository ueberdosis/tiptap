import { NodeType } from 'prosemirror-model'
import { setBlockType } from 'prosemirror-commands'
import { Editor } from '../Editor'
import nodeIsActive from '../utils/nodeIsActive'

type ToggleBlockType = (
  type: NodeType,
  toggleType: NodeType,
  attrs?: {}
) => any

declare module '../Editor' {
  interface Editor {
    toggleBlockType: ToggleBlockType,
  }
}

export default (next: Function, editor: Editor): ToggleBlockType => (type, toggleType, attrs) => {
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
