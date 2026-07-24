import { Decoration, DecorationSet } from '@tiptap/pm/view'

import type { SearchResult } from '../search/search.js'

import type { TextblockRange } from './types.js'

export function findDecorations(
  decorations: DecorationSet,
  results: readonly SearchResult[],
  textblocks: readonly TextblockRange[],
): Decoration[] {
  const found = new Set<Decoration>()

  textblocks.forEach(textblock => {
    decorations.find(textblock.from, textblock.to).forEach(decoration => found.add(decoration))
  })

  results.forEach(result => {
    decorations
      .find(result.from, result.to, decoration => {
        return decoration.from === result.from && decoration.to === result.to
      })
      .forEach(decoration => found.add(decoration))
  })

  return [...found]
}
