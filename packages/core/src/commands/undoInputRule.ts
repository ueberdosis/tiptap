import { undoInputRule as originalUndoInputRule } from 'prosemirror-inputrules'
import { Command, Commands } from '../types'

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

export const undoInputRule: Commands['undoInputRule'] = () => ({ state, dispatch }) => {
  return originalUndoInputRule(state, dispatch)
}
