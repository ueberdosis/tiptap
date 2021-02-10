import { Command, Commands } from '../types'

/**
 * Insert a string of text at the current position.
 */
export const insertText: Commands['insertText'] = value => ({ tr, dispatch }) => {
  if (dispatch) {
    tr.insertText(value)
  }

  return true
}

declare module '@tiptap/core' {
  interface Commands {
    insertText: (value: string) => Command,
  }
}
