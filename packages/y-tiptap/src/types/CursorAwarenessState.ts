import type { relativePositionToJSON } from 'yjs'
import type { CursorUser } from './CursorUser.js'

/** A selection stored as Yjs relative positions. */
export type CursorAwarenessSelection = {
  anchor: ReturnType<typeof relativePositionToJSON>
  head: ReturnType<typeof relativePositionToJSON>
}

/** A collaborative field's latest selection, kept after its editor loses focus. */
export type CursorAwarenessLastSelection = CursorAwarenessSelection & {
  /** Local timestamp in milliseconds of the last update, used to pick the newest selection. */
  time: number
  /** Whether the field's editor had focus when the entry was written. */
  focused: boolean
}

export interface CursorAwarenessState {
  user?: Partial<CursorUser> | null
  cursor?: CursorAwarenessSelection | null
  /**
   * The latest selection of each collaborative field, keyed by field name. Unlike `cursor`, an
   * entry stays after its editor loses focus, until the client leaves awareness.
   */
  lastSelection?: Record<string, CursorAwarenessLastSelection>
  [key: string]: unknown
}
