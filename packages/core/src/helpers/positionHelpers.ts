import type { Range } from '@tiptap/core'
import type { EditorState, Transaction } from '@tiptap/pm/state'
import type { MapResult } from '@tiptap/pm/transform'

type WithOptionalProperties<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>

/**
 * A type that represents a Y.js relative position. Used to map a position from
 * a transaction, handling both Yjs changes and regular transactions.
 *
 * If the editor is not collaborative, the value can be `null`.
 */
export type YRelativePosition = any | null

/**
 * A type that represents the Y.js relative positions of a range. Used to map a
 * range from a transaction, handling both Yjs changes and regular transactions.
 */
export interface YRelativeRange {
  from: YRelativePosition
  to: YRelativePosition
}

/**
 * Options for the mapPositionFromTransaction function.
 */
export interface MapPositionFromTransactionOptions {
  transaction: Transaction
  state: EditorState
  position: number
  yRelativePosition: YRelativePosition
}

/**
 * The result of the mapPositionFromTransaction function.
 */
export interface MapPositionFromTransactionResult {
  newPosition: number
  newYRelativePosition: YRelativePosition
  mapResult: MapResult | null
}

/**
 * Options for the mapRangeFromTransaction function.
 */
export interface MapRangeFromTransactionOptions {
  transaction: Transaction
  state: EditorState
  range: Range
  yRelativeRange: YRelativeRange
}

/**
 * The result of the mapRangeFromTransaction function.
 */
export interface MapRangeFromTransactionResult {
  newRange: Range
  newYRelativeRange: YRelativeRange
  mapResultFrom: MapResult | null
  mapResultTo: MapResult | null
}

/**
 * Calculates the new position after applying a transaction. Handles both Y.js
 * transactions and regular transactions.
 *
 * @returns The new position, the Y.js relative position, and the map result.
 */
export function mapPositionFromTransaction({
  transaction,
  position,
  yRelativePosition,
}: MapPositionFromTransactionOptions): MapPositionFromTransactionResult {
  const mapResult = transaction.mapping.mapResult(position)
  return {
    newPosition: mapResult.pos,
    newYRelativePosition: yRelativePosition,
    mapResult,
  }
}

/**
 * Calculates the new range after applying a transaction. Handles both Y.js
 * transactions and regular transactions.
 *
 * @returns The new range, the Y.js relative range, and the map results.
 */
export function mapRangeFromTransaction({
  range,
  yRelativeRange,
  ...options
}: MapRangeFromTransactionOptions): MapRangeFromTransactionResult {
  const fromResult = mapPositionFromTransaction({
    position: range.from,
    yRelativePosition: yRelativeRange.from,
    ...options,
  })
  const toResult = mapPositionFromTransaction({
    position: range.to,
    yRelativePosition: yRelativeRange.to,
    ...options,
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

// The methods below are implemented by the Collaboration extension,
// if you try to call them without the Collaboration extension installed,
// an error will be thrown.
const missingCollabExtensionError = new Error('Collaboration extension not installed')

export function getYAbsolutePosition(): number {
  throw missingCollabExtensionError
}

export function getYRelativePosition(): YRelativePosition {
  throw missingCollabExtensionError
}

export function getYAbsoluteRange(): Range {
  throw missingCollabExtensionError
}

export function getYRelativeRange(): YRelativeRange {
  throw missingCollabExtensionError
}

/**
 * Helper methods for working with positions and ranges.
 */
export interface PositionHelpers {
  /**
   * Returns the new position after applying a transaction. Handles both Y.js
   * transactions and regular transactions.
   */
  mapPositionFromTransaction: (
    options: WithOptionalProperties<MapPositionFromTransactionOptions, 'state'>,
  ) => MapPositionFromTransactionResult

  /**
   * Returns the new Range after applying a transaction. Handles both Y.js
   * transactions and regular transactions.
   */
  mapRangeFromTransaction: (
    options: WithOptionalProperties<MapRangeFromTransactionOptions, 'state'>,
  ) => MapRangeFromTransactionResult

  /**
   * Converts a Y.js relative position to a position in the editor.
   */
  getYAbsolutePosition: (relativePos: YRelativePosition) => number

  /**
   * Converts a position in the editor to a Y.js relative position.
   */
  getYRelativePosition: (absolutePos: number) => YRelativePosition

  /**
   * Converts a Y.js relative range to a Range in the editor.
   */
  getYAbsoluteRange: (yRelativeRange: YRelativeRange) => Range

  /**
   * Converts a Range in the editor to a Y.js relative range.
   */
  getYRelativeRange: (absoluteRange: Range) => YRelativeRange
}
