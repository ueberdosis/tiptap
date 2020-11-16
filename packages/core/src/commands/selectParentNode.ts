import { selectParentNode } from 'prosemirror-commands'
import { Command } from '../types'

export default (): Command => ({ state, dispatch }) => {
  return selectParentNode(state, dispatch)
}
