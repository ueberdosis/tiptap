import type { CommandProps, CommandSpec } from '../types.js'

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

export const clearContent: CommandSpec =
  (emitUpdate = true) =>
  ({ commands }: CommandProps) => {
    // @ts-ignore - setContent command is dynamically added
    return commands.setContent('', { emitUpdate })
  }
