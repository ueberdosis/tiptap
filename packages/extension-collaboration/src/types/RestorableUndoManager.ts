import type { UndoManager } from 'yjs'

export type RestorableUndoManager = UndoManager & {
  restore?: () => void
}
