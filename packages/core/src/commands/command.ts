import { Command, Commands } from '../types'

/**
 * Define a command inline.
 */
export const command: Commands['command'] = fn => props => {
  return fn(props)
}

declare module '@tiptap/core' {
  interface Commands {
    command: (fn: (props: Parameters<Command>[0]) => boolean) => Command,
  }
}
