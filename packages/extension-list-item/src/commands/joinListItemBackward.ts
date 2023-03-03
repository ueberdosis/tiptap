import { RawCommands } from '@tiptap/core'

export const joinListItemBackward: RawCommands['splitListItem'] = () => ({
  tr, state, dispatch,
}) => {
  tr.join(state.selection.$from.pos - 2, 2)

  if (dispatch) {
    dispatch(tr)
  }

  return true
}
