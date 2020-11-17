import { deleteSelection } from 'prosemirror-commands'
import { Command } from '../types'

export default (): Command => ({ state, dispatch }) => {
  return deleteSelection(state, dispatch)
}
