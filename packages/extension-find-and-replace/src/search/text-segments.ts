import type { TextblockSearchTarget } from './types.js'

interface TextSegment {
  isText: boolean
  pos: number
  length: number
  text: string
  textOffset: number
}

// Non-text inline nodes (hard break, mention, ...) contribute a placeholder
// so matches never silently span across them.
export function getTextSegments(textblocks: readonly TextblockSearchTarget[]): TextSegment[] {
  const segments: TextSegment[] = []
  let textOffset = 0

  textblocks.forEach(({ node, pos }) => {
    node.forEach((child, offset) => {
      const text = child.isText ? (child.text ?? '') : '\n'

      segments.push({
        isText: child.isText,
        pos: pos + 1 + offset,
        length: child.nodeSize,
        text,
        textOffset,
      })
      textOffset += text.length
    })
  })

  return segments
}

function findOffsetSegment(segments: TextSegment[], offset: number): TextSegment | undefined {
  let low = 0
  let high = segments.length

  while (low < high) {
    const middle = Math.floor((low + high) / 2)
    const segment = segments[middle]
    const segmentEnd = segment.textOffset + segment.text.length

    if (offset < segmentEnd) {
      high = middle
    } else {
      low = middle + 1
    }
  }

  return segments[low] ?? segments.at(-1)
}

export function offsetToPos(segments: TextSegment[], offset: number): number {
  const segment = findOffsetSegment(segments, offset)

  return segment ? segment.pos + Math.min(offset - segment.textOffset, segment.length) : 0
}

// Resolve the last matched character, so an end at a textblock boundary stays in that textblock
export function endOffsetToPos(segments: TextSegment[], offset: number): number {
  return offsetToPos(segments, offset - 1) + 1
}

export function overlapsNonTextSegment(segments: TextSegment[], from: number, to: number): boolean {
  return segments.some(
    segment =>
      !segment.isText && from < segment.textOffset + segment.text.length && to > segment.textOffset,
  )
}
