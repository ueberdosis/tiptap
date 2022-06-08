// @ts-ignore
// TODO: add types to @types/prosemirror-commands
import { selectTextblockStart as originalSelectTextblockStart } from 'prosemirror-commands'

import { RawCommands } from '../types'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    selectTextblockStart: {
      /**
       * Moves the cursor to the start of current text block.
       */
      selectTextblockStart: () => ReturnType,
    }
  }
}

export const selectTextblockStart: RawCommands['selectTextblockStart'] = () => ({ state, dispatch }) => {
  return originalSelectTextblockStart(state, dispatch)
}
