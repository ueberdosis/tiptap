import { Command } from '../Editor'
import { createExtension } from '../Extension'

export const Blur = createExtension({
  addCommands() {
    return {
      blur: (): Command => ({ view }) => {
        const element = view.dom as HTMLElement

        element.blur()

        return true
      },
    }
  },
})

declare module '../Editor' {
  interface AllExtensions {
    Blur: typeof Blur,
  }
}
