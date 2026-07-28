import type { Node } from '@tiptap/pm/model'

interface TextSegment {
  isText: boolean
  pos: number
  length: number
  text: string
  textOffset: number
}

interface TextblockSearchContext {
  segments: TextSegment[]
  text: string
}

// Non-text inline nodes (hard break, mention, ...) contribute a placeholder
// so matches never silently span across them.
function getTextSegments(textblock: Node, pos: number): TextSegment[] {
  const segments: TextSegment[] = []
  let textOffset = 0

  textblock.forEach((child, offset) => {
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

  return segments
}

export function createTextblockSearchContext(textblock: Node, pos: number): TextblockSearchContext {
  const segments = getTextSegments(textblock, pos)

  return {
    segments,
    text: segments.map(segment => segment.text).join(''),
  }
}

function findPositionSegment(segments: TextSegment[], pos: number): TextSegment | undefined {
  let low = 0
  let high = segments.length

  while (low < high) {
    const middle = Math.floor((low + high) / 2)
    const segment = segments[middle]

    if (pos <= segment.pos + segment.length) {
      high = middle
    } else {
      low = middle + 1
    }
  }

  return segments[low] ?? segments.at(-1)
}

export function textOffsetAtPos(context: TextblockSearchContext, pos: number): number {
  const segment = findPositionSegment(context.segments, pos)

  if (!segment) {
    return context.text.length
  }

  return segment.textOffset + Math.max(0, Math.min(pos - segment.pos, segment.text.length))
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

export function overlapsNonTextSegment(segments: TextSegment[], from: number, to: number): boolean {
  return segments.some(
    segment =>
      !segment.isText && from < segment.textOffset + segment.text.length && to > segment.textOffset,
  )
}
