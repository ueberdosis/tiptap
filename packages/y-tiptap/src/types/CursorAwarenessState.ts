import type { relativePositionToJSON } from 'yjs'
import type { CursorUser } from './CursorUser.js'

export interface CursorAwarenessState {
  user?: Partial<CursorUser> | null
  cursor?: {
    anchor: ReturnType<typeof relativePositionToJSON>
    head: ReturnType<typeof relativePositionToJSON>
  } | null
  [key: string]: unknown
}
