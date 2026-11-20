import type { ResolvedPos } from 'prosemirror-model'

export interface PrependedBlock {
  before: ResolvedPos
  inserted: number
  start: number
  end: number
}
