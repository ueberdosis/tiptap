import { Command } from '../Editor'
import { createExtension } from '../Extension'

export const InsertText = createExtension({
  addCommands() {
    return {
      insertText: (value: string): Command => ({ tr, dispatch }) => {
        if (dispatch) {
          tr.insertText(value)
        }

        return true
      },
    }
  },
})

declare module '../Editor' {
  interface AllExtensions {
    InsertText: typeof InsertText,
  }
}
