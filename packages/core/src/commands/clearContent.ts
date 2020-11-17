import { Command } from '../types'

export default (emitUpdate: Boolean = false): Command => ({ commands }) => {
  return commands.setContent('', emitUpdate)
}
