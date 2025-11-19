import type { Range } from '@tiptap/core'
import type { Transaction } from '@tiptap/pm/state'
import type { MapResult } from '@tiptap/pm/transform'

/**
 * The result of the mapPositionFromTransaction function.
 */
export interface MapPositionFromTransactionResult {
  position: number
  mapResult: MapResult | null
}

/**
 * The result of the mapRangeFromTransaction function.
 */
export interface MapRangeFromTransactionResult {
  newRange: Range
  mapResultFrom: MapResult | null
  mapResultTo: MapResult | null
}

/**
 * Helper methods for working with positions and ranges.
 */
export interface PositionHelpers {
  /**
   * Returns the new position after applying a transaction.
   */
  getUpdatedPosition(position: number, transaction: Transaction): MapPositionFromTransactionResult

  /**
   * Returns the new position after applying a transaction.
   */
  getUpdatedRange(range: Range, transaction: Transaction): MapRangeFromTransactionResult
}
