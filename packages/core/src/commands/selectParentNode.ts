import { selectParentNode } from 'prosemirror-commands'
import { Command } from '../Editor'

export default (): Command => ({ state, dispatch }) => {
  return selectParentNode(state, dispatch)
}
