import { Command, RawCommands } from '../types'

declare module '@tiptap/core' {
  interface AllCommands {
    insertText: {
      /**
       * Insert a string of text at the current position.
       */
      insertText: (value: string) => Command,
    }
  }
}

export const insertText: RawCommands['insertText'] = value => ({ tr, dispatch }) => {
  if (dispatch) {
    tr.insertText(value)
  }

  return true
}
