import { Command, Commands } from '../types'

declare module '@tiptap/core' {
  interface Commands {
    /**
     * Trigger enter.
     */
    enter: () => Command,
  }
}

export const enter: Commands['enter'] = () => ({ commands }) => {
  return commands.keyboardShortcut('Enter')
}
