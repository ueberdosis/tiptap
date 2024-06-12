// @ts-ignore
// TODO: add types to @types/prosemirror-commands
import { selectTextblockStart as originalSelectTextblockStart } from '@tiptap/pm/commands'

import { RawCommands } from '../types.js'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    selectTextblockStart: {
      /**
       * Moves the cursor to the start of current text block.
       * @example editor.commands.selectTextblockStart()
       */
      selectTextblockStart: () => ReturnType
    }
  }
}

export const selectTextblockStart: RawCommands['selectTextblockStart'] = () => ({ state, dispatch }) => {
  return originalSelectTextblockStart(state, dispatch)
}
