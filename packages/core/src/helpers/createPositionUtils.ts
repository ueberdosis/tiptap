import type { Transaction } from '@tiptap/pm/state'

import type { GetUpdatedPositionResult, GetUpdatedRangeResult, Range, Utils } from '../types.js'

/**
 * Creates a Utils object with position and range mapping functions.
 * The implementation uses getUpdatedPositions internally for efficiency.
 *
 * @param getUpdatedPositions A function that maps multiple positions from a transaction
 * @returns A Utils object with getUpdatedPosition, getUpdatedPositions, and getUpdatedRange
 */
export function createPositionUtils(): Utils {
  const getUpdatedPosition = (position: number, transaction: Transaction): GetUpdatedPositionResult => {
    const results = transaction.mapping.mapResult(position)
    return {
      position: results.pos,
      mapResult: results,
    }
  }

  const getUpdatedPositions = (positions: number[], transaction: Transaction): GetUpdatedPositionResult[] => {
    return positions.map(position => getUpdatedPosition(position, transaction))
  }

  return {
    getUpdatedPosition,
    getUpdatedPositions,
    getUpdatedRange(range: Range, transaction: Transaction): GetUpdatedRangeResult {
      const [fromResult, toResult] = getUpdatedPositions([range.from, range.to], transaction)

      return {
        range: {
          from: fromResult.position,
          to: toResult.position,
        },
        mapResultFrom: fromResult.mapResult,
        mapResultTo: toResult.mapResult,
      }
    },
  }
}
