import { selectAll } from 'prosemirror-commands'
import { Command } from '../Editor'

export default (): Command => ({ state, dispatch }) => {
  return selectAll(state, dispatch)
}
