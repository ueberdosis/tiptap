import { Command } from '../Editor'
import { createExtension } from '../Extension'

export const ScrollIntoView = createExtension({
  addCommands() {
    return {
      scrollIntoView: (): Command => ({ tr, dispatch }) => {
        if (dispatch) {
          tr.scrollIntoView()
        }

        return true
      },
    }
  },
})

declare module '../Editor' {
  interface AllExtensions {
    ScrollIntoView: typeof ScrollIntoView,
  }
}
