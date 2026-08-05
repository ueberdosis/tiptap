import { Decoration } from '@tiptap/pm/view'

import { currentResultClass, resultClass } from '../constants/constants.js'
import type { SearchResult } from '../search/search.js'

/**
 * Build the highlight for one result.
 */
export function createDecoration(
  result: SearchResult,
  currentIndex: number | null,
  index: number,
): Decoration {
  const className = index === currentIndex ? `${resultClass} ${currentResultClass}` : resultClass

  return Decoration.inline(result.from, result.to, { class: className })
}
