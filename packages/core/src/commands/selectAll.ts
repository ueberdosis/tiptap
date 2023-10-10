import { RawCommands } from '../types.js'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    selectAll: {
      /**
       * Select the whole document.
       */
      selectAll: () => ReturnType,
    }
  }
}

export const selectAll: RawCommands['selectAll'] = () => ({ tr, commands }) => {
  return commands.setTextSelection({
    from: 0,
    to: tr.doc.content.size,
  })
}
