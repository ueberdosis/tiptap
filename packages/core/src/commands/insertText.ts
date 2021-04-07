import { Command, RawCommands } from '../types'

declare module '@tiptap/core' {
  interface Commands {
    insertText: {
      /**
       * Insert a string of text at the current position.
       */
      insertText: (value: string) => Command,
    }
  }
}

export const insertText: RawCommands['insertText'] = value => ({ tr, dispatch }) => {
  console.warn('[tiptap warn]: insertText() is deprecated. please use insertContent() instead.')

  if (dispatch) {
    tr.insertText(value)
  }

  return true
}
