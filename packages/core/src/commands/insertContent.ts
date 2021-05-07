import { Command, RawCommands, Content } from '../types'

declare module '@tiptap/core' {
  interface Commands {
    insertContent: {
      /**
       * Insert a node or string of HTML at the current position.
       */
      insertContent: (value: Content) => Command,
    }
  }
}

export const insertContent: RawCommands['insertContent'] = value => ({ tr, commands }) => {
  return commands.insertContentAt({ from: tr.selection.from, to: tr.selection.to }, value)
}
