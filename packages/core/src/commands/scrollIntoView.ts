import { Command } from '../Editor'

export default (): Command => ({ tr, dispatch }) => {
  if (dispatch) {
    tr.scrollIntoView()
  }

  return true
}
