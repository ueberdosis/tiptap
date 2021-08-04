import { CreateNodeFromContentOptions } from '../helpers/createNodeFromContent'
import { RawCommands, Content } from '../types'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    insertContent: {
      /**
       * Insert a node or string of HTML at the current position.
       */
      insertContent: (value: Content, options?: CreateNodeFromContentOptions) => ReturnType,
    }
  }
}

export const insertContent: RawCommands['insertContent'] = (value, options) => ({ tr, commands }) => {
  return commands.insertContentAt({ from: tr.selection.from, to: tr.selection.to }, value, options)
}
