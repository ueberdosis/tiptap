import type { FindAndReplaceMeta } from '../plugin/plugin-state.js'

/**
 * Whether a command started a different search.
 */
export function isNewSearch(meta: FindAndReplaceMeta | undefined): boolean {
  return !!meta && 'searchTerm' in meta
}
