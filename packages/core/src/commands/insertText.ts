import { Command } from '../types'

export default (value: string): Command => ({ tr, dispatch }) => {
  if (dispatch) {
    tr.insertText(value)
  }

  return true
}
