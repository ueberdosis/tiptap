import { Command } from '../Editor'
import { createExtension } from '../Extension'

export const Try = createExtension({
  addCommands() {
    return {
      try: (fn: (props: Parameters<Command>[0]) => Command[]): Command => props => {
        const commands = fn(props)

        for (let i = 0; i < commands.length; i += 1) {
          if (commands[i](props)) {
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
