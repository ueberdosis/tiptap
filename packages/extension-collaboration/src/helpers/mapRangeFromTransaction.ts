import type { MapRangeFromTransactionOptions, MapRangeFromTransactionResult } from '@tiptap/core'

import { mapPositionFromTransaction } from './mapPositionFromTransaction.js'

export function mapRangeFromTransaction(options: MapRangeFromTransactionOptions): MapRangeFromTransactionResult {
  const { range, yRelativeRange } = options
  const fromResult = mapPositionFromTransaction({
    ...options,
    position: range.from,
    yRelativePosition: yRelativeRange.from,
  })
  const toResult = mapPositionFromTransaction({
    ...options,
    position: range.to,
    yRelativePosition: yRelativeRange.to,
  })
  return {
    newRange: {
      from: fromResult.newPosition,
      to: toResult.newPosition,
    },
    newYRelativeRange: {
      from: fromResult.newYRelativePosition,
      to: toResult.newYRelativePosition,
    },
    mapResultFrom: fromResult.mapResult,
    mapResultTo: toResult.mapResult,
  }
}
