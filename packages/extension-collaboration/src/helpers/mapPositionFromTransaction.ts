import type { MapPositionFromTransactionOptions, MapPositionFromTransactionResult } from '@tiptap/core'
import { mapPositionFromTransaction as coreMapPositionFromTransaction } from '@tiptap/core'

import { isChangeOrigin } from './isChangeOrigin.js'
import { getYAbsolutePosition, getYRelativePosition } from './yRelativePosition.js'

/**
 * Returns the new position after applying a transaction. Handles both Y.js
 * transactions and regular transactions.
 */
export function mapPositionFromTransaction(
  options: MapPositionFromTransactionOptions,
): MapPositionFromTransactionResult {
  const { transaction, state, yRelativePosition } = options
  if (isChangeOrigin(transaction)) {
    /**
     * If there is no yRelativePosition that we can use to get the new position,
     * we'll use this position as a fallback.
     */
    const fallbackPosition = Math.min(options.position, state.doc.content.size)

    return {
      newPosition: yRelativePosition ? getYAbsolutePosition(state, yRelativePosition) : fallbackPosition,
      newYRelativePosition: yRelativePosition ?? getYRelativePosition(state, fallbackPosition),
      mapResult: null,
    }
  }

  const result = coreMapPositionFromTransaction(options)
  return {
    newPosition: result.newPosition,
    newYRelativePosition: getYRelativePosition(state, result.newPosition),
    mapResult: result.mapResult,
  }
}
