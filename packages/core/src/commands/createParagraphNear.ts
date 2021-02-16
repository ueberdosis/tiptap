import { createParagraphNear as originalCreateParagraphNear } from 'prosemirror-commands'
import { Command, RawCommands } from '../types'

declare module '@tiptap/core' {
  interface Commands {
    createParagraphNear: {
      /**
       * Create a paragraph nearby.
       */
      createParagraphNear: () => Command,
    }
  }
}

export const createParagraphNear: RawCommands['createParagraphNear'] = () => ({ state, dispatch }) => {
  return originalCreateParagraphNear(state, dispatch)
}
