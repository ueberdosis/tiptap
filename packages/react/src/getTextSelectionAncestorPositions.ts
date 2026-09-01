import { isTextSelection } from '@tiptap/core'
import type { ResolvedPos } from '@tiptap/pm/model'
import type { Selection } from '@tiptap/pm/state'

function isSameAncestor($from: ResolvedPos, $to: ResolvedPos, depth: number): boolean {
  return $from.node(depth) === $to.node(depth) && $from.before(depth) === $to.before(depth)
}

export function getTextSelectionAncestorPositions(selection: Selection): number[] {
  if (!isTextSelection(selection)) {
    return []
  }

  const { $from, $to } = selection
  const positions: number[] = []
  const maxDepth = Math.min($from.depth, $to.depth)

  for (let depth = 1; depth <= maxDepth; depth += 1) {
    if (!isSameAncestor($from, $to, depth)) {
      break
    }

    positions.push($from.before(depth))
  }

  return positions
}
