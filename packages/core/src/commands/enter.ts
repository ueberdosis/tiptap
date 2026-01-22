import type { CommandSpec } from '../types.js'

declare module '@dibdab/core' {
  interface Commands<ReturnType> {
    enter: {
      /**
       * Trigger enter.
       * @example editor.commands.enter()
       */
      enter: () => ReturnType
    }
  }
}

export const enter: CommandSpec =
  () =>
  ({ commands }) => {
    return commands.keyboardShortcut('Enter')
  }
