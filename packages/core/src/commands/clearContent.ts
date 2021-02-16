import { Command, RawCommands } from '../types'

declare module '@tiptap/core' {
  interface Commands {
    clearContent: {
      /**
       * Clear the whole document.
       */
      clearContent: (emitUpdate: Boolean) => Command,
    }
  }
}

export const clearContent: RawCommands['clearContent'] = (emitUpdate = false) => ({ commands }) => {
  return commands.setContent('', emitUpdate)
}
