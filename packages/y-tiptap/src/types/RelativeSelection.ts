import type { RelativePosition } from 'yjs'

/** Selection endpoints and their positions before a Yjs document update. */
export interface RelativeSelection {
  type: string
  depth: number | undefined
  anchor: RelativePosition
  head: RelativePosition
  absAnchor: number
  absHead: number
}
