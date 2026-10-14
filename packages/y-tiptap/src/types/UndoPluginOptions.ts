import type { UndoManager } from 'yjs'

/** Options for local undo history and protected node types. */
export interface UndoPluginOptions {
  protectedNodes?: Set<string>
  trackedOrigins?: unknown[]
  undoManager?: UndoManager | null
}
