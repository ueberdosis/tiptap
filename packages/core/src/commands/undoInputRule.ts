import { undoInputRule as originalUndoInputRule } from 'prosemirror-inputrules'
import { Command } from '../types'

/**
 * Undo an input rule.
 */
export const undoInputRule = (): Command => ({ state, dispatch }) => {
  return originalUndoInputRule(state, dispatch)
}
