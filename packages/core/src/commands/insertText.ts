import { Command } from '../Editor'

export default (value: string): Command => ({ tr, dispatch }) => {
  if (dispatch) {
    tr.insertText(value)
  }

  return true
}
