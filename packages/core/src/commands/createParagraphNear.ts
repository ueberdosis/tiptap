import { createParagraphNear as originalCreateParagraphNear } from '@tiptap/pm/commands'

import { RawCommands } from '../types.js'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    createParagraphNear: {
      /**
       * Create a paragraph nearby.
       */
      createParagraphNear: () => ReturnType
    }
  }
}

export const createParagraphNear: RawCommands['createParagraphNear'] = () => ({ state, dispatch }) => {
  return originalCreateParagraphNear(state, dispatch)
}
