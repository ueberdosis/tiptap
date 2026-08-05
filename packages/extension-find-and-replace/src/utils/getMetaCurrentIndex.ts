import type { FindAndReplaceMeta } from '../plugin/plugin-state.js'

import { hasCurrentIndex } from './hasCurrentIndex.js'
import { normalizeCurrentIndex } from './normalizeCurrentIndex.js'

/**
 * Read the index a command asked for.
 * @returns `undefined` when no command asked for one.
 */
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
