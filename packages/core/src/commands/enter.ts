import { Command, RawCommands } from '../types'

declare module '@tiptap/core' {
  interface AllCommands {
    enter: {
      /**
       * Trigger enter.
       */
      enter: () => Command,
    }
  }
}

export const enter: RawCommands['enter'] = () => ({ commands }) => {
  return commands.keyboardShortcut('Enter')
}
