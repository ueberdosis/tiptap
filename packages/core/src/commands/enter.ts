import { Command, Commands } from '../types'

/**
 * Trigger enter.
 */
export const enter: Commands['enter'] = () => ({ commands }) => {
  return commands.keyboardShortcut('Enter')
}

declare module '@tiptap/core' {
  interface Commands {
    enter: () => Command,
  }
}
