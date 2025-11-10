import type { MapPositionFromTransactionOptions, MapPositionFromTransactionResult } from '@tiptap/core'
import { mapPositionFromTransaction as coreMapPositionFromTransaction } from '@tiptap/core'

import { isChangeOrigin } from './isChangeOrigin.js'
import { getYAbsolutePosition } from './yRelativePosition.js'

export function mapPositionFromTransaction(
  options: MapPositionFromTransactionOptions,
): MapPositionFromTransactionResult {
  const { transaction, state, yRelativePosition } = options
  if (isChangeOrigin(transaction)) {
    return {
      newPosition: getYAbsolutePosition(state, yRelativePosition),
      newYRelativePosition: yRelativePosition,
      mapResult: null,
    }
  }

  return coreMapPositionFromTransaction(options)
}
