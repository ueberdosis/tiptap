import { selectAll } from 'prosemirror-commands'
import { Command } from '../types'

export default (): Command => ({ state, dispatch }) => {
  return selectAll(state, dispatch)
}
