// @ts-ignore
// TODO: add types to @types/prosemirror-commands
import { selectTextblockEnd as originalSelectTextblockEnd } from 'prosemirror-commands'

import { RawCommands } from '../types'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    selectTextblockEnd: {
      /**
       * Moves the cursor to the end of current text block.
       */
      selectTextblockEnd: () => ReturnType,
    }
  }
}

export const selectTextblockEnd: RawCommands['selectTextblockEnd'] = () => ({ state, dispatch }) => {
  return originalSelectTextblockEnd(state, dispatch)
}
