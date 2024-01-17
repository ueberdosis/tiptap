import { RawCommands } from '../types.js'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    enter: {
      /**
       * Trigger enter.
       */
      enter: () => ReturnType,
    }
  }
}

export const enter: RawCommands['enter'] = () => ({ commands }) => {
  return commands.keyboardShortcut('Enter')
}
