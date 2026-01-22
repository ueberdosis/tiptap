import { deleteSelection as originalDeleteSelection } from '@dibdab/pm/commands'

import type { RawCommands } from '../types.js'

declare module '@dibdab/core' {
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
    return originalDeleteSelection(state, dispatch)
  }
