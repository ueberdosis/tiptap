import { Command, Commands } from '../types'

/**
 * Clear the whole document.
 */
export const clearContent: Commands['clearContent'] = (emitUpdate = false) => ({ commands }) => {
  return commands.setContent('', emitUpdate)
}

declare module '@tiptap/core' {
  interface Commands {
    clearContent: (emitUpdate: Boolean) => Command,
  }
}
