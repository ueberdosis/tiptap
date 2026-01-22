import { AllSelection } from '@dibdab/pm/state'

import type { CommandSpec } from '../types.js'

declare module '@dibdab/core' {
  interface Commands<ReturnType> {
    selectAll: {
      /**
       * Select the whole document.
       * @example editor.commands.selectAll()
       */
      selectAll: () => ReturnType
    }
  }
}

export const selectAll: CommandSpec =
  () =>
  ({ tr, dispatch }) => {
    if (dispatch) {
      const selection = new AllSelection(tr.doc)

      tr.setSelection(selection)
    }

    return true
  }
