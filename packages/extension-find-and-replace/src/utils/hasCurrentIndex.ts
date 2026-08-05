import type { FindAndReplaceMeta } from '../plugin/plugin-state.js'

/**
 * Whether a command asked to move to a certain result.
 */
export function hasCurrentIndex(meta: FindAndReplaceMeta | undefined): boolean {
  return !!meta && 'currentIndex' in meta
}
