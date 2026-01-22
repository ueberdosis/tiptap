import type { RawCommands } from '../types.js'

declare module '@dibdab/core' {
  interface Commands<ReturnType> {
    clearContent: {
      /**
       * Clear the whole document.
       * @example editor.commands.clearContent()
       */
      clearContent: (
        /**
         * Whether to emit an update event.
         * @default true
         */
        emitUpdate?: boolean,
      ) => ReturnType
    }
  }
}

export const clearContent: RawCommands['clearContent'] =
  (emitUpdate = true) =>
  ({ commands }) => {
    return commands.setContent('', { emitUpdate })
  }
