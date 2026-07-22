import type { Mapping } from '@tiptap/pm/transform'

import type { FindAndReplaceMeta, FindAndReplacePluginState } from '../plugin-state.js'
import type { SearchResult } from '../search.js'

import { getMetaCurrentIndex } from './getMetaCurrentIndex.js'
import { getSearchCurrentIndex } from './getSearchCurrentIndex.js'

export function resolveCurrentIndex(
  previousState: FindAndReplacePluginState,
  results: SearchResult[],
  meta: FindAndReplaceMeta | undefined,
  docChanged: boolean,
  mapping: Mapping | undefined,
): number | null {
  if (results.length === 0) {
    return null
  }

  const metaIndex = getMetaCurrentIndex(meta, results.length)

  if (metaIndex !== undefined) {
    return metaIndex
  }

  return getSearchCurrentIndex(previousState, results, meta, docChanged, mapping)
}
