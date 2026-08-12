import type { Node } from '@tiptap/pm/model'

/**
 * Resolves a document position to the `[from, to)` range of its containing
 * top-level block node in absolute document positions.
 */
export function resolveTopLevelRange(doc: Node, pos: number): { from: number; to: number } {
  const resolved = doc.resolve(pos)

  if (resolved.depth === 0) {
    const node = resolved.nodeAfter ?? resolved.nodeBefore

    if (!node) {
      return { from: pos, to: pos }
    }

    const nodePos = resolved.nodeAfter ? pos : pos - node.nodeSize

    return { from: nodePos, to: nodePos + node.nodeSize }
  }

  const topLevelPos = resolved.before(1)
  const node = resolved.node(1)

  return { from: topLevelPos, to: topLevelPos + node.nodeSize }
}

/**
 * Converts an absolute document range to content-relative positions used by
 * `Node#nodesBetween` and `Node#forEach` offsets.
 */
export function toContentRelativeRange(
  doc: Node,
  range: { from: number; to: number },
): { from: number; to: number } {
  return {
    from: Math.max(0, range.from - 1),
    to: Math.min(doc.content.size, range.to - 1),
  }
}

/**
 * Returns the top-level block ranges that intersect a document change range.
 * Input `from`/`to` are absolute positions (e.g. from `getChangedRanges`).
 * Returned ranges are content-relative, matching `Node#forEach` offsets.
 */
export function getTopLevelBlocksInRange(
  doc: Node,
  from: number,
  to: number,
): Array<{ from: number; to: number }> {
  const ranges: Array<{ from: number; to: number }> = []

  doc.forEach((node, offset) => {
    const nodeStart = offset
    const nodeEnd = nodeStart + node.nodeSize
    const absNodeStart = nodeStart + 1
    const absNodeEnd = nodeEnd + 1

    if (absNodeStart < to && absNodeEnd > from) {
      ranges.push({ from: nodeStart, to: nodeEnd })
    }
  })

  return ranges
}

/**
 * Sorts ranges by start position and merges overlapping or adjacent ranges.
 */
export function mergeRanges(
  ranges: Array<{ from: number; to: number }>,
): Array<{ from: number; to: number }> {
  if (ranges.length === 0) {
    return []
  }

  const sorted = [...ranges].sort((a, b) => a.from - b.from)
  const merged: Array<{ from: number; to: number }> = [{ ...sorted[0] }]

  for (let i = 1; i < sorted.length; i += 1) {
    const last = merged[merged.length - 1]
    const current = sorted[i]

    if (current.from <= last.to) {
      last.to = Math.max(last.to, current.to)
    } else {
      merged.push({ ...current })
    }
  }

  return merged
}
