import { findMatches } from './matches.js'
import type { SearchRegex } from './regex.js'
import {
  endOffsetToPos,
  getTextSegments,
  offsetToPos,
  overlapsNonTextSegment,
} from './text-segments.js'
import type { SearchResult, TextblockSearchTarget } from './types.js'

export function searchTextblockGroup(
  regex: SearchRegex,
  textblocks: readonly TextblockSearchTarget[],
): SearchResult[] {
  const segments = getTextSegments(textblocks)
  const text = segments.map(segment => segment.text).join('')
  const results: SearchResult[] = []

  for (const match of findMatches(regex, text)) {
    if (match.value.length === 0) {
      continue
    }

    const matchEnd = match.index + match.value.length

    if (overlapsNonTextSegment(segments, match.index, matchEnd)) {
      continue
    }

    results.push({
      from: offsetToPos(segments, match.index),
      to: endOffsetToPos(segments, matchEnd),
    })
  }

  return results
}
