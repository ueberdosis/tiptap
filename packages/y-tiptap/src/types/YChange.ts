import type { ID } from 'yjs'
import type { ColorDef } from './ColorDef.js'

export interface YChange {
  type: 'added' | 'removed'
  user: string | null
  color: ColorDef
}

export type ComputeYChange = (type: YChange['type'], id: ID) => YChange
