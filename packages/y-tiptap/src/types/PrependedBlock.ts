import type { Node, ResolvedPos } from 'prosemirror-model'

export interface PrependedBlock {
  before: ResolvedPos
  inserted: number
  insertedChildren?: readonly Node[]
  start: number
  end: number
}
