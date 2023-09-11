import { RawCommands } from '../types.js'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    clearContent: {
      /**
       * Clear the whole document.
       * @param emitUpdate Whether to emit an update event.
       * @example editor.commands.clearContent()
       */
      clearContent: (emitUpdate?: boolean) => ReturnType,
    }
  }
}

export const clearContent: RawCommands['clearContent'] = (emitUpdate = false) => ({ commands }) => {
  return commands.setContent('', emitUpdate)
}
