import type { CommandSpec } from '../types.js'

declare module '@dibdab/core' {
  interface Commands<ReturnType> {
    scrollIntoView: {
      /**
       * Scroll the selection into view.
       * @example editor.commands.scrollIntoView()
       */
      scrollIntoView: () => ReturnType
    }
  }
}

export const scrollIntoView: CommandSpec =
  () =>
  ({ tr, dispatch }) => {
    if (dispatch) {
      tr.scrollIntoView()
    }

    return true
  }
