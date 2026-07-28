import type { Node } from '@tiptap/pm/model'

import type { SearchRegex } from '../search/regex.js'
import type { SearchResult } from '../search/search.js'
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
 * @param doc The document containing the search results.
 * @param replacement The replacement template.
 * @param regex The compiled regex, or `null` for literal replacement.
 * @param indexMatches Whether to index every textblock match for a batch replacement.
 * @returns A resolver for the replacement text of each result.
 */
export function createResultReplacement(
  doc: Node,
  replacement: string,
  regex: SearchRegex | null,
  indexMatches = false,
): ResultReplacement {
  if (!regex || !hasReplacementTokens(replacement)) {
    return () => replacement
  }

  const contexts = new Map<number, ReplacementContext>()

  return result => {
    const $from = doc.resolve(result.from)
    const textblock = $from.parent
    const textblockPos = $from.start() - 1
    let context = contexts.get(textblockPos)

    if (!context) {
      const search = createTextblockSearchContext(textblock, textblockPos)

      context = {
        expand: indexMatches ? createReplacementExpander(regex, search.text, replacement) : null,
        search,
      }
      contexts.set(textblockPos, context)
    }

    const from = textOffsetAtPos(context.search, result.from)
    const to = textOffsetAtPos(context.search, result.to)

    return context.expand
      ? context.expand(from, to)
      : expandReplacement(regex, context.search.text, replacement, from, to)
  }
}
