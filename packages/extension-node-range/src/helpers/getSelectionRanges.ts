import { NodeRange, ResolvedPos } from '@tiptap/pm/model'
import { SelectionRange } from '@tiptap/pm/state'

export function getSelectionRanges(
  $from: ResolvedPos,
  $to: ResolvedPos,
  depth?: number,
): SelectionRange[] {
  const ranges: SelectionRange[] = []
  const doc = $from.node(0)

  // eslint-disable-next-line
  depth = (typeof depth === 'number' && depth >= 0)
    ? depth
    : $from.sameParent($to)
      ? Math.max(0, $from.sharedDepth($to.pos) - 1)
      : $from.sharedDepth($to.pos)

  const nodeRange = new NodeRange($from, $to, depth)
  const offset = nodeRange.depth === 0
    ? 0
    : doc.resolve(nodeRange.start).posAtIndex(0)

  nodeRange.parent.forEach((node, pos) => {
    const from = offset + pos
    const to = from + node.nodeSize

    if (from < nodeRange.start || from >= nodeRange.end) {
      return
    }

    const selectionRange = new SelectionRange(doc.resolve(from), doc.resolve(to))

    ranges.push(selectionRange)
  })

  return ranges
}
