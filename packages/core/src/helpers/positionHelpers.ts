import type { Range } from '@tiptap/core'
import type { EditorState, Transaction } from '@tiptap/pm/state'
import type { MapResult } from '@tiptap/pm/transform'

type WithOptionalProperties<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>

/**
 * A type that represents a Y.js relative position. Used to map a position from
 * a transaction, handling both Yjs changes and regular transactions.
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
  yRelativeRange: YRelativePosition
}

/**
 * The result of the mapRangeFromTransaction function.
 */
export interface MapRangeFromTransactionResult {
  newRange: Range
  newYRelativeRange: YRelativePosition
  mapResultFrom: MapResult | null
  mapResultTo: MapResult | null
}

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

const notImplementedError = new Error('Not implemented')

export function getYAbsolutePosition(): number {
  throw notImplementedError
}

export function getYRelativePosition(): YRelativePosition {
  throw notImplementedError
}

export function getYAbsoluteRange(): Range {
  throw notImplementedError
}

export function getYRelativeRange(): YRelativeRange {
  throw notImplementedError
}

/**
 * Helper methods for working with positions and ranges.
 */
export interface PositionHelpers {
  /**
   * Maps a position from a transaction, handling both Yjs changes and regular transactions.
   */
  mapPositionFromTransaction: (
    options: WithOptionalProperties<MapPositionFromTransactionOptions, 'state'>,
  ) => MapPositionFromTransactionResult

  /**
   * Maps a range from a transaction, handling both Yjs changes and regular transactions.
   */
  mapRangeFromTransaction: (
    options: WithOptionalProperties<MapRangeFromTransactionOptions, 'state'>,
  ) => MapRangeFromTransactionResult

  /**
   * Converts a Y.js relative position to an absolute position in the editor.
   */
  getYAbsolutePosition: (relativePos: YRelativePosition) => number

  /**
   * Converts an absolute position in the editor to a Y.js relative position.
   */
  getYRelativePosition: (absolutePos: number) => YRelativePosition

  /**
   * Converts a Y.js relative range to an absolute range in the editor.
   */
  getYAbsoluteRange: (yRelativeRange: YRelativeRange) => Range

  /**
   * Converts an absolute range in the editor to a Y.js relative range.
   */
  getYRelativeRange: (absoluteRange: Range) => YRelativeRange
}
