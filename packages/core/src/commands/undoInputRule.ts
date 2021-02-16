import { undoInputRule as originalUndoInputRule } from 'prosemirror-inputrules'
import { Command, RawCommands } from '../types'

declare module '@tiptap/core' {
  interface AllCommands {
    undoInputRule: {
      /**
       * Undo an input rule.
       */
      undoInputRule: () => Command,
    }
  }
}

export const undoInputRule: RawCommands['undoInputRule'] = () => ({ state, dispatch }) => {
  return originalUndoInputRule(state, dispatch)
}
