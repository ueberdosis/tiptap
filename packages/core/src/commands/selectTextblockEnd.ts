// @ts-ignore
// TODO: add types to @types/prosemirror-commands
import { selectTextblockEnd as originalSelectTextblockEnd } from '@tiptap/pm/commands'

import type { RawCommands } from '../types.js'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    selectTextblockEnd: {
      /**
       * Moves the cursor to the end of current text block.
       * @example editor.commands.selectTextblockEnd()
       */
      selectTextblockEnd: () => ReturnType
    }
  }
}

export const selectTextblockEnd: RawCommands['selectTextblockEnd'] =
  () =>
  ({ state, dispatch }) => {
    return originalSelectTextblockEnd(state, dispatch)
  }
