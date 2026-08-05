import type { Mapping } from '@tiptap/pm/transform'

import type { FindAndReplacePluginState } from '../plugin/plugin-state.js'
import type { SearchResult } from '../search/search.js'
import { findNextIndex } from '../search/search.js'

import { getPreviousCurrentResult } from './getPreviousCurrentResult.js'

/**
 * Follow the result the user was on through a document change, and find it again in the new results.
 * @returns `undefined` when the document did not change or the result is gone.
 */
export function getMappedCurrentIndex(
  previousState: FindAndReplacePluginState,
  results: SearchResult[],
  docChanged: boolean,
  mapping: Mapping | undefined,
): number | null | undefined {
  if (!docChanged) {
    return undefined
  }

  if (!mapping) {
    return undefined
  }

  const previousResult = getPreviousCurrentResult(previousState)

  if (!previousResult) {
    return undefined
  }

  const mappedFrom = mapping.map(previousResult.from, 1)

  return findNextIndex(results, mappedFrom)
}
