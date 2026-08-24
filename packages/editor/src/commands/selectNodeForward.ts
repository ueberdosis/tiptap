import { selectNodeForward as originalSelectNodeForward } from 'prosemirror-commands'

import type { RawCommands } from '../types.js'

declare module '@tiptap/editor' {
  interface Commands<ReturnType> {
    selectNodeForward: {
      /**
       * Select a node forward.
       * @example editor.commands.selectNodeForward()
       */
      selectNodeForward: () => ReturnType
    }
  }
}

export const selectNodeForward: RawCommands['selectNodeForward'] =
  () =>
  ({ state, dispatch }) => {
    return originalSelectNodeForward(state, dispatch)
  }
