import type { Mapping } from '@tiptap/pm/transform'

import type { FindAndReplacePluginState } from '../plugin-state.js'
import type { SearchResult } from '../search.js'
import { findNextIndex } from '../search.js'

import { getPreviousCurrentResult } from './getPreviousCurrentResult.js'

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
