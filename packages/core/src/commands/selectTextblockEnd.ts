// @ts-ignore
// TODO: add types to @types/prosemirror-commands
import { selectTextblockEnd as originalSelectTextblockEnd } from '@tiptap/pm/commands'

import { RawCommands } from '../types.js'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    selectTextblockEnd: {
      /**
       * Moves the cursor to the end of current text block.
       */
      selectTextblockEnd: () => ReturnType
    }
  }
}

export const selectTextblockEnd: RawCommands['selectTextblockEnd'] = () => ({ state, dispatch }) => {
  return originalSelectTextblockEnd(state, dispatch)
}
