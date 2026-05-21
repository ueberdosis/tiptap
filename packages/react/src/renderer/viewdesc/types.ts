import type { MarkView as PMMarkView, NodeView as PMNodeView } from '@tiptap/pm/view'

import type { ReactViewDesc } from './base.js'

/** Dirty flags PM-view reads during selection sync. */
export const NOT_DIRTY = 0
export const CHILD_DIRTY = 1
export const CONTENT_DIRTY = 2
export const NODE_DIRTY = 3

export type DOMNode = InstanceType<typeof window.Node>

export type NodeViewSet = {
  [name: string]: ((...args: never[]) => PMNodeView) | ((...args: never[]) => PMMarkView)
}

// PM-view stores a back-pointer from every DOM node to its descriptor.
// We use the same global augmentation.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Node {
    pmViewDesc?: ReactViewDesc
  }
}
