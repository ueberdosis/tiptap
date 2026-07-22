import type { SearchResult } from '../search.js'

import type { TextblockRange } from './types.js'

export function resultInTextblocks(
  result: SearchResult,
  textblocks: readonly TextblockRange[],
): boolean {
  let start = 0
  let end = textblocks.length - 1

  while (start <= end) {
    const index = Math.floor((start + end) / 2)
    const textblock = textblocks[index]

    if (result.from < textblock.from) {
      end = index - 1
      continue
    }

    if (result.to > textblock.to) {
      start = index + 1
      continue
    }

    return true
  }

  return false
}
