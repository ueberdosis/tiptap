import { isNodeRangeSelection, NodeRangeSelection } from '@tiptap/extension-node-range'
import type { Node as ProseMirrorNode } from '@tiptap/pm/model'
import type { Selection } from '@tiptap/pm/state'

export interface ActiveDragRange {
  anchorPos: number
  nodeCount: number
  depth: number
  // Yjs relative position for remapping the drop anchor across isChangeOrigin rebuilds.
  // biome-ignore lint/suspicious/noExplicitAny: y-prosemirror relative positions are untyped
  relativeAnchorPos?: any
}

interface MapPendingRestoreAnchorOptions {
  isChangeOrigin: boolean
  getAbsolutePos: (relativePos: unknown) => number
}

// Remaps the drop anchor while a restore is pending. Returns null when the anchor
// can no longer be resolved.
export function mapPendingRestoreAnchor(
  pendingRestore: ActiveDragRange,
  tr: {
    docChanged: boolean
    mapping: { mapResult: (pos: number, bias: number) => { deleted: boolean; pos: number } }
  },
  options: MapPendingRestoreAnchorOptions,
): ActiveDragRange | null {
  if (!tr.docChanged) {
    return pendingRestore
  }

  if (options.isChangeOrigin && pendingRestore.relativeAnchorPos != null) {
    const newPos = options.getAbsolutePos(pendingRestore.relativeAnchorPos)

    if (!Number.isFinite(newPos) || newPos <= 0) {
      return null
    }

    return {
      ...pendingRestore,
      anchorPos: newPos,
    }
  }

  const mappedResult = tr.mapping.mapResult(pendingRestore.anchorPos, 1)

  if (mappedResult.deleted) {
    return null
  }

  return {
    ...pendingRestore,
    anchorPos: mappedResult.pos,
  }
}

interface DroppedBlockRange {
  anchor: number
  head: number
  count: number
}

function sumNodeSizes(parent: ProseMirrorNode, from: number, to: number): number {
  let size = 0

  for (let i = from; i < to; i += 1) {
    size += parent.child(i).nodeSize
  }

  return size
}

// Captures a multi-block node range at dragstart so it can be restored after drop.
export function getActiveDragRange(selection: Selection): ActiveDragRange | null {
  if (!isNodeRangeSelection(selection)) {
    return null
  }

  return {
    anchorPos: selection.from,
    nodeCount: selection.ranges.length,
    depth: selection.depth ?? 0,
  }
}

/**
 * Computes the position range of the freshly dropped blocks so a
 * `NodeRangeSelection` can be restored over them after a drag-and-drop.
 */
function getDroppedBlockRange(
  doc: ProseMirrorNode,
  anchorPos: number,
  nodeCount: number,
  depth: number,
): DroppedBlockRange | null {
  const $pos = doc.resolve(anchorPos)
  const parent = $pos.node(depth)
  let index = $pos.index(depth)

  // the drop can land past the last child, so clamp the index back into range
  if (index >= parent.childCount) {
    index = Math.max(0, parent.childCount - nodeCount)
  }

  const count = Math.min(nodeCount, parent.childCount - index)

  if (count <= 0) {
    return null
  }

  const blockStart = $pos.start(depth) + sumNodeSizes(parent, 0, index)
  const blockEnd = blockStart + sumNodeSizes(parent, index, index + count)

  return { anchor: blockStart, head: blockEnd, count }
}

// Rebuilds the dragged node range over the dropped blocks, or null when unsafe.
export function createDroppedNodeRangeSelection(
  doc: ProseMirrorNode,
  anchorPos: number,
  nodeCount: number,
  depth: number,
): NodeRangeSelection | null {
  try {
    const range = getDroppedBlockRange(doc, anchorPos, nodeCount, depth)

    if (!range) {
      return null
    }

    const selection = NodeRangeSelection.create(doc, range.anchor, range.head, depth)

    return selection.ranges.length === nodeCount ? selection : null
  } catch {
    return null
  }
}
