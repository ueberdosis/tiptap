import { undoInputRule as originalUndoInputRule } from 'prosemirror-inputrules'
import { Command, Commands } from '../types'

/**
 * Undo an input rule.
 */
export const undoInputRule: Commands['undoInputRule'] = () => ({ state, dispatch }) => {
  return originalUndoInputRule(state, dispatch)
}

declare module '@tiptap/core' {
  interface Commands {
    undoInputRule: () => Command,
  }
}
