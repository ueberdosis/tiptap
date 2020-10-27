import { Command } from '../Editor'
import { createExtension } from '../Extension'

export const ClearContent = createExtension({
  addCommands() {
    return {
      clearContent: (emitUpdate: Boolean = false): Command => ({ commands }) => {
        return commands.setContent('', emitUpdate)
      },
    }
  },
})

declare module '../Editor' {
  interface AllExtensions {
    ClearContent: typeof ClearContent,
  }
}
