import type { EditorState } from '@tiptap/pm/state'
import { yUndoPluginKey } from '@tiptap/y-tiptap'
import type { RestorableUndoManager } from '../types/RestorableUndoManager.js'

export function getUndoManager(state: EditorState): RestorableUndoManager {
  const undoState = yUndoPluginKey.getState(state)
  if (!undoState) throw new Error('Collaboration requires the Yjs undo plugin')
  return undoState.undoManager
}
