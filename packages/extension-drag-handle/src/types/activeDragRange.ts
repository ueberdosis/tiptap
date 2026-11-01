import type { RelativePosition } from '@tiptap/y-tiptap'

export interface ActiveDragRange {
  anchorPos: number
  nodeCount: number
  depth: number
  relativeAnchorPos?: RelativePosition
}
