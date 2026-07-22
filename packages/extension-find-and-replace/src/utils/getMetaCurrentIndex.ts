import type { FindAndReplaceMeta } from '../plugin-state.js'

import { hasCurrentIndex } from './hasCurrentIndex.js'
import { normalizeCurrentIndex } from './normalizeCurrentIndex.js'

export function getMetaCurrentIndex(
  meta: FindAndReplaceMeta | undefined,
  length: number,
): number | null | undefined {
  if (!meta) {
    return undefined
  }

  if (!hasCurrentIndex(meta)) {
    return undefined
  }

  return normalizeCurrentIndex(meta.currentIndex, length)
}
