import { Command, RawCommands } from '../types.js'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    command: {
      /**
       * Define a command inline.
       * @param fn The command function.
       * @example
       * editor.commands.command(({ tr, state }) => {
       *   ...
       *   return true
       * })
       */
      command: (fn: (props: Parameters<Command>[0]) => boolean) => ReturnType,
    }
  }
}

export const command: RawCommands['command'] = fn => props => {
  return fn(props)
}
