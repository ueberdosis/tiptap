import type { FindAndReplaceMeta } from '../plugin-state.js'

export function hasCurrentIndex(meta: FindAndReplaceMeta | undefined): boolean {
  return !!meta && 'currentIndex' in meta
}
