import type { Node } from '@tiptap/pm/model'

import { findMatches } from './matches.js'
import type { SearchRegex } from './regex.js'
import {
  createTextblockSearchContext,
  offsetToPos,
  overlapsNonTextSegment,
} from './text-segments.js'
import type { SearchResult } from './types.js'

export function searchTextblock(regex: SearchRegex, textblock: Node, pos: number): SearchResult[] {
  const { segments, text } = createTextblockSearchContext(textblock, pos)
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
      to: offsetToPos(segments, matchEnd),
    })
  }

  return results
}
