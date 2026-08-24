import type { RawCommands } from '../types.js'

declare module '@tiptap/editor' {
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

export const enter: RawCommands['enter'] =
  () =>
  ({ commands }) => {
    return commands.keyboardShortcut('Enter')
  }
