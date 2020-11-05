import { deleteSelection } from 'prosemirror-commands'
import { Command } from '../Editor'

export default (): Command => ({ state, dispatch }) => {
  return deleteSelection(state, dispatch)
}
