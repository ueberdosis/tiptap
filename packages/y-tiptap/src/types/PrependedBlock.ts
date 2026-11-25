import type { ResolvedPos } from 'prosemirror-model'

export interface PrependedBlock {
  before: ResolvedPos
  inserted: number
  insertedChildren?: readonly { from: number; to: number }[]
  originalSiblings?: readonly { from: number; to: number }[]
  startsTransaction: boolean
  start: number
  end: number
}
