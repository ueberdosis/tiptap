import { Command } from '../Editor'
import { createExtension } from '../Extension'

export const Try = createExtension({
  addCommands() {
    return {
      try: (commands: Command[] | ((props: Parameters<Command>[0]) => Command[])): Command => props => {
        const items = typeof commands === 'function'
          ? commands(props)
          : commands

        for (let i = 0; i < items.length; i += 1) {
          if (items[i](props)) {
            return true
          }
        }

        return false
      },
    }
  },
})

declare module '../Editor' {
  interface AllExtensions {
    Try: typeof Try,
  }
}
