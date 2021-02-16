import { Command, Commands } from '../types'

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

export const enter: Commands['enter'] = () => ({ commands }) => {
  return commands.keyboardShortcut('Enter')
}
