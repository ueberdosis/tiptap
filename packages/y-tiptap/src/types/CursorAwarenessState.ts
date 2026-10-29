import type { relativePositionToJSON } from 'yjs'
import type { CursorUser } from './CursorUser.js'

/** A selection stored as Yjs relative positions. */
export type CursorAwarenessSelection = {
  anchor: ReturnType<typeof relativePositionToJSON>
  head: ReturnType<typeof relativePositionToJSON>
}

/** A field's latest selection, kept after its editor loses focus. */
export type CursorAwarenessLastSelection = CursorAwarenessSelection & {
  /** Local time of the last update in milliseconds. */
  time: number
  /** Whether the field's editor had focus at that time. */
  focused: boolean
}

/** The awareness state written by `yCursorPlugin`. */
export interface CursorAwarenessState {
  user?: Partial<CursorUser> | null
  cursor?: CursorAwarenessSelection | null
  /** Latest selection per root field name, kept until the client leaves awareness. */
  lastSelection?: Record<string, CursorAwarenessLastSelection>
  [key: string]: unknown
}
