import { RawCommands } from '../types'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    clearContent: {
      /**
       * Clear the whole document.
       */
      clearContent: (emitUpdate?: boolean) => ReturnType,
    }
  }
}

export const clearContent: RawCommands['clearContent'] = (emitUpdate = false) => ({ commands }) => {
  return commands.setContent('', emitUpdate)
}
