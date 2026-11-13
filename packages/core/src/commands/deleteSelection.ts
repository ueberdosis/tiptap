import { deleteSelectionOnTransaction } from '../helpers/deleteSelectionOnTransaction.js'
import type { RawCommands } from '../types.js'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    deleteSelection: {
      /**
       * Delete the selection, if there is one.
       * @example editor.commands.deleteSelection()
       */
      deleteSelection: () => ReturnType
    }
  }
}

export const deleteSelection: RawCommands['deleteSelection'] =
  () =>
  ({ state, dispatch }) => {
    if (state.selection.empty) {
      return false
    }

    if (dispatch) {
      const tr = state.tr

      deleteSelectionOnTransaction(tr, state.schema)

      tr.scrollIntoView()
      dispatch(tr)
    }

    return true
  }
