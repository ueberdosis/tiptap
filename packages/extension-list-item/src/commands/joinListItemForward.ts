import { RawCommands } from '@tiptap/core'
import { joinPoint } from '@tiptap/pm/transform'

export const joinListItemForward: RawCommands['splitListItem'] = () => ({
  state,
  dispatch,
  tr,
}) => {
  try {
    const point = joinPoint(state.doc, state.selection.$from.pos, +1)

    if (point === null || point === undefined) {
      return false
    }

    tr.join(point, 2)

    if (dispatch) {
      dispatch(tr)
    }

    return true
  } catch (e) {
    return false
  }
}
