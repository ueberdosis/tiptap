import type { ResolvedPos } from 'prosemirror-model'

export interface PrependedBlock {
  before: ResolvedPos
  inserted: number
  insertedChildren?: readonly { from: number; to: number }[]
  start: number
  end: number
}
