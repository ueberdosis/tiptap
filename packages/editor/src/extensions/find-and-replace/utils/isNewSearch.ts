import type { FindAndReplaceMeta } from '../plugin/plugin-state.js'

export function isNewSearch(meta: FindAndReplaceMeta | undefined): boolean {
  return !!meta && 'searchTerm' in meta
}
