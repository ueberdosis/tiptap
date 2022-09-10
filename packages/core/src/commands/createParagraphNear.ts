import { createParagraphNear as originalCreateParagraphNear } from 'prosemirror-commands'

import { RawCommands } from '../types'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    createParagraphNear: {
      /**
       * Create a paragraph nearby.
       */
      createParagraphNear: () => ReturnType,
    }
  }
}

export const createParagraphNear: RawCommands['createParagraphNear'] = () => ({ state, dispatch }) => {
  return originalCreateParagraphNear(state, dispatch)
}
