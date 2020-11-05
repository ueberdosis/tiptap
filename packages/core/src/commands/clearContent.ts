import { Command } from '../Editor'

export default (emitUpdate: Boolean = false): Command => ({ commands }) => {
  return commands.setContent('', emitUpdate)
}
