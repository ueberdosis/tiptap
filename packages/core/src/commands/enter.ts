import { RawCommands } from '../types.js'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    enter: {
      /**
       * Trigger enter.
       * @example editor.commands.enter()
       */
      enter: () => ReturnType,
    }
  }
}

export const enter: RawCommands['enter'] = () => ({ commands }) => {
  return commands.keyboardShortcut('Enter')
}
