import type { Doc, UndoManager } from 'yjs'
import type { RelativeSelection } from './RelativeSelection.js'

/** Local undo history and the selection saved before each transaction. */
export interface UndoPluginState {
  undoManager: UndoManager
  prevSel: RelativeSelection | null
  hasUndoOps: boolean
  hasRedoOps: boolean
  destroyListeners: Set<(document: Doc) => void>
}
