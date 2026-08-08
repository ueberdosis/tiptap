import type { Node } from '@tiptap/pm/model'

import type { SearchResult } from '../search/search.js'
import type { SearchMatcher } from '../search/search-matcher.js'
import { createTextblockSearchContext, textOffsetAtPos } from '../search/text-segments.js'
import {
  createReplacementExpander,
  expandReplacement,
  hasReplacementTokens,
  type ReplacementExpander,
} from './expandReplacement.js'

export type ResultReplacement = (result: SearchResult) => string

interface ReplacementContext {
  expand: ReplacementExpander | null
  search: ReturnType<typeof createTextblockSearchContext>
}

/**
 * Creates a replacement resolver that re-matches results in their textblock context.
 * Search results store only positions, so capture values must be recovered from the textblock.
 * @param doc The document containing the search results.
 * @param replacement The replacement template.
 * @param matcher The compiled matcher, or `null` for literal replacement.
 * @param indexMatches Whether to index every textblock match for a batch replacement.
 * @returns A resolver for the replacement text of each result.
 */
export function createResultReplacement(
  doc: Node,
  replacement: string,
  matcher: SearchMatcher | null,
  indexMatches = false,
): ResultReplacement {
  if (!matcher || !hasReplacementTokens(replacement)) {
    return () => replacement
  }

  const { regex, resultGroup } = matcher
  // Key by position because one immutable ProseMirror node can appear in multiple places.
  const contexts = new Map<number, ReplacementContext>()

  return result => {
    const $from = doc.resolve(result.from)
    const textblock = $from.parent
    // `start()` points inside the textblock; the node itself starts one position earlier.
    const textblockPos = $from.start() - 1
    let context = contexts.get(textblockPos)

    if (!context) {
      const search = createTextblockSearchContext(textblock, textblockPos)

      context = {
        expand: indexMatches
          ? createReplacementExpander(regex, search.text, replacement, resultGroup)
          : null,
        search,
      }
      contexts.set(textblockPos, context)
    }

    const from = textOffsetAtPos(context.search, result.from)
    const to = textOffsetAtPos(context.search, result.to)

    return context.expand
      ? context.expand(from, to)
      : expandReplacement(regex, context.search.text, replacement, from, to, resultGroup)
  }
}
