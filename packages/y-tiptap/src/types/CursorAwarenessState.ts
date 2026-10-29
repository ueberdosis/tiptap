import type { relativePositionToJSON } from 'yjs'
import type { CursorUser } from './CursorUser.js'

/** A selection stored as Yjs relative positions. */
export type CursorAwarenessSelection = {
  anchor: ReturnType<typeof relativePositionToJSON>
  head: ReturnType<typeof relativePositionToJSON>
}

export interface CursorAwarenessState {
  user?: Partial<CursorUser> | null
  cursor?: CursorAwarenessSelection | null
  /**
   * The selection each collaborative field had when its editor lost focus, keyed by field
   * name. `time` is the local timestamp in milliseconds, used to pick the newest selection.
   */
  lastSelection?: Record<string, CursorAwarenessSelection & { time: number }>
  [key: string]: unknown
}
