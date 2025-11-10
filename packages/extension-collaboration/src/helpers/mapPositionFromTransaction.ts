import type { MapPositionFromTransactionOptions, MapPositionFromTransactionResult } from '@tiptap/core'
import { mapPositionFromTransaction as coreMapPositionFromTransaction } from '@tiptap/core'

import { isChangeOrigin } from './isChangeOrigin.js'
import { getYAbsolutePosition, getYRelativePosition } from './yRelativePosition.js'

export function mapPositionFromTransaction(
  options: MapPositionFromTransactionOptions,
): MapPositionFromTransactionResult {
  const { transaction, state, yRelativePosition } = options
  if (isChangeOrigin(transaction)) {
    return {
      newPosition: yRelativePosition ? getYAbsolutePosition(state, yRelativePosition) : options.position,
      newYRelativePosition: yRelativePosition,
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
