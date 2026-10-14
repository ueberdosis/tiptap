import type { Doc, PermanentUserData, Snapshot, XmlFragment } from 'yjs'
import type { ProsemirrorBinding } from '../lib/utils/binding/ProsemirrorBinding.js'
import type { ColorDef } from './ColorDef.js'
import type { PositionMigrationPlan } from './PositionMigration.js'

/** Shared document and rendering state exposed by the sync plugin. */
export interface SyncPluginState {
  type: XmlFragment
  doc: Doc
  binding: ProsemirrorBinding
  snapshot?: Snapshot | Uint8Array | null
  prevSnapshot?: Snapshot | Uint8Array | null
  restore?: boolean
  isChangeOrigin: boolean
  isUndoRedoOperation: boolean
  addToHistory: boolean
  colors: ColorDef[]
  colorMapping: Map<string | null, ColorDef>
  permanentUserData: PermanentUserData | null
  positionMigration?: PositionMigrationPlan | null
}
