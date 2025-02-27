import type { Command, CommandProps, RawCommands } from '../types.js'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    first: {
      /**
       * Runs one command after the other and stops at the first which returns true.
       * @param commands The commands to run.
       * @example editor.commands.first([command1, command2])
       */
      first: (commands: Command[] | ((props: CommandProps) => Command[])) => ReturnType
    }
  }
}

export const first: RawCommands['first'] = commands => props => {
  const items = typeof commands === 'function' ? commands(props) : commands

  for (let i = 0; i < items.length; i += 1) {
    if (items[i](props)) {
      return true
    }
  }

  return false
}
