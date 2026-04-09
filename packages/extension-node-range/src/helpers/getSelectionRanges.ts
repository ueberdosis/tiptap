import { type ResolvedPos, NodeRange } from '@tiptap/pm/model'
import { SelectionRange } from '@tiptap/pm/state'

export interface GetSelectionRangesOptions {
  /**
   * Whether nodes should be included when the selection only overlaps their
   * start or end content boundary.
   * @default true
   */
  extendOnBoundaryOverlap?: boolean
}

function getNodeContentBounds(nodeStart: number, nodeSize: number, node: { isText: boolean; isAtom: boolean }) {
  const contentOffset = node.isText || node.isAtom ? 0 : 1

  return {
    start: nodeStart + contentOffset,
    end: nodeStart + nodeSize - contentOffset,
  }
}

/**
 * Calculates node-aligned selection ranges between two resolved positions.
 *
 * The helper derives a suitable depth when none is provided and returns a
 * `SelectionRange` for each matching child node in the computed `NodeRange`.
 * Each returned range exposes `$from` as the resolved start position of the
 * node selection and `$to` as the resolved end position.
 *
 * @param $from The resolved anchor position where the selection starts.
 * @param $to The resolved head position where the selection ends.
 * @param depth An optional depth to force when creating the ProseMirror `NodeRange`.
 * When omitted, the depth is inferred from the shared depth of `$from` and `$to`.
 * @param options Optional behavior flags for how boundary nodes are handled.
 * @param options.extendOnBoundaryOverlap Whether touching only a node's start
 * or end content boundary should still include that node in the returned ranges.
 * @returns An array of `SelectionRange` objects for the nodes covered at the
 * computed depth.
 * @example
 * ```ts
 * const { $from, $to } = editor.state.selection
 * const ranges = getSelectionRanges($from, $to, undefined, {
 *   extendOnBoundaryOverlap: false,
 * })
 *
 * ranges.forEach(range => {
 *   console.log(range.$from.pos, range.$to.pos)
 * })
 * ```
 */
export function getSelectionRanges(
  $from: ResolvedPos,
  $to: ResolvedPos,
  depth?: number,
  options: GetSelectionRangesOptions = {},
): SelectionRange[] {
  const ranges: SelectionRange[] = []
  const doc = $from.node(0)
  const { extendOnBoundaryOverlap = true } = options

  // Determine the appropriate depth
  if (typeof depth === 'number' && depth >= 0) {
    // Use the provided depth
  } else if ($from.sameParent($to)) {
    depth = Math.max(0, $from.sharedDepth($to.pos) - 1)
  } else {
    depth = $from.sharedDepth($to.pos)
  }

  const nodeRange = new NodeRange($from, $to, depth)
  const offset = nodeRange.depth === 0 ? 0 : doc.resolve(nodeRange.start).posAtIndex(0)

  nodeRange.parent.forEach((node, pos) => {
    const from = offset + pos
    const to = from + node.nodeSize
    const contentBounds = getNodeContentBounds(from, node.nodeSize, node)
    const overlapsNodeContent = extendOnBoundaryOverlap
      ? $to.pos >= contentBounds.start && $from.pos <= contentBounds.end
      : $to.pos > contentBounds.start && $from.pos < contentBounds.end

    if (from < nodeRange.start || from >= nodeRange.end) {
      return
    }

    if (!overlapsNodeContent) {
      return
    }

    const selectionRange = new SelectionRange(doc.resolve(from), doc.resolve(to))

    ranges.push(selectionRange)
  })

  return ranges
}
